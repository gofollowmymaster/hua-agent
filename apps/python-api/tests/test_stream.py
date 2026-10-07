import asyncio
import logging
from collections.abc import AsyncIterator
from typing import Any, cast

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

import python_api.modules.agent.chat.router as agent_router_module
import python_api.modules.rag.chat.router as rag_router_module
from python_api.core.config import get_settings
from python_api.core.database import get_db
from python_api.core.errors import install_exception_handlers
from python_api.core.resources import get_app_settings, get_redis
from python_api.core.stream import UI_STREAM_ERROR_TEXT, stream_response
from python_api.integrations.redis import RedisService
from python_api.modules.auth.dependencies import require_bearer, require_composite_auth


async def _response_body(response: Any) -> bytes:
    """Collects a StreamingResponse body for protocol assertions."""
    chunks = [chunk async for chunk in response.body_iterator]
    return b"".join(chunk.encode() if isinstance(chunk, str) else chunk for chunk in chunks)


async def _override_db() -> AsyncIterator[AsyncSession]:
    """Provides an unused database dependency for isolated router tests."""
    yield cast(AsyncSession, None)


def _agent_app() -> FastAPI:
    """Builds an isolated Agent router with authenticated fake dependencies."""
    app = FastAPI()
    install_exception_handlers(app)
    app.include_router(agent_router_module.router)
    app.dependency_overrides[get_db] = _override_db
    app.dependency_overrides[get_app_settings] = get_settings
    app.dependency_overrides[require_composite_auth] = lambda: {"userId": 7}
    return app


def _rag_app() -> FastAPI:
    """Builds an isolated RAG router with authenticated fake dependencies."""
    app = FastAPI()
    install_exception_handlers(app)
    app.include_router(rag_router_module.router)
    app.dependency_overrides[get_db] = _override_db
    app.dependency_overrides[get_redis] = lambda: cast(RedisService, None)
    app.dependency_overrides[get_app_settings] = get_settings
    app.dependency_overrides[require_bearer] = lambda: {"userId": 7}
    return app


def _chat_body() -> dict[str, Any]:
    """Returns the smallest valid UI Message chat request."""
    return {
        "id": "conversation-1",
        "messages": [
            {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "你好"}]}
        ],
    }


@pytest.mark.asyncio
async def test_stream_response_finishes_successful_stream_with_done() -> None:
    async def events() -> AsyncIterator[dict[str, Any]]:
        yield {"type": "text-delta", "id": "text-1", "delta": "完成"}

    body = await _response_body(stream_response(events(), stream_name="test_chat"))

    assert b'"type":"text-delta"' in body
    assert body.endswith(b"data: [DONE]\n\n")


@pytest.mark.asyncio
async def test_stream_response_converts_runtime_error_without_leaking_detail(
    caplog: pytest.LogCaptureFixture,
) -> None:
    secret = "postgresql://secret@database/private/path"

    async def events() -> AsyncIterator[dict[str, Any]]:
        yield {"type": "data-status", "data": {"stage": "generate_start"}}
        raise RuntimeError(secret)

    caplog.set_level(logging.ERROR, logger="python_api.stream")
    body = await _response_body(stream_response(events(), stream_name="agent_chat"))

    assert b'"type":"error"' in body
    assert UI_STREAM_ERROR_TEXT.encode() in body
    assert b"[DONE]" not in body
    assert "stream=agent_chat" in caplog.text
    assert "exception_type=RuntimeError" in caplog.text
    assert secret not in caplog.text


@pytest.mark.asyncio
async def test_stream_response_does_not_convert_cancellation() -> None:
    async def events() -> AsyncIterator[dict[str, Any]]:
        raise asyncio.CancelledError
        yield {}

    with pytest.raises(asyncio.CancelledError):
        await _response_body(stream_response(events(), stream_name="test_chat"))


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("router_module", "app_factory", "path"),
    [
        (agent_router_module, _agent_app, "/agent/chat"),
        (rag_router_module, _rag_app, "/ai/rag/chat"),
    ],
)
async def test_preparation_failure_uses_global_json_error_handler(
    monkeypatch: pytest.MonkeyPatch,
    router_module: Any,
    app_factory: Any,
    path: str,
) -> None:
    class FailingService:
        """Represents a chat service whose required startup query fails."""

        def __init__(self, *_args: Any, **_kwargs: Any) -> None:
            pass

        async def prepare_stream(self, _request: Any) -> AsyncIterator[dict[str, Any]]:
            """Fails before a StreamingResponse can be created."""
            raise RuntimeError("agent_user_skills relation is missing")

    service_name = "AgentChatService" if path == "/agent/chat" else "RagChatService"
    monkeypatch.setattr(router_module, service_name, FailingService)
    app = app_factory()

    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
    ) as client:
        response = await client.post(path, json=_chat_body())

    assert response.status_code == 500
    assert response.headers["content-type"].startswith("application/json")
    assert response.json() == {
        "code": 500,
        "message": "Internal Server Error",
        "path": path,
    }


@pytest.mark.asyncio
async def test_agent_runtime_failure_returns_ai_sdk_error_event(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    class FailingStreamService:
        """Returns an iterator that fails only after streaming has started."""

        def __init__(self, *_args: Any, **_kwargs: Any) -> None:
            pass

        async def prepare_stream(self, _request: Any) -> AsyncIterator[dict[str, Any]]:
            """Returns a prepared iterator with a deterministic runtime failure."""

            async def events() -> AsyncIterator[dict[str, Any]]:
                yield {"type": "data-status", "data": {"stage": "generate_start"}}
                raise RuntimeError("provider secret response")

            return events()

    monkeypatch.setattr(agent_router_module, "AgentChatService", FailingStreamService)
    caplog.set_level(logging.ERROR, logger="python_api.stream")
    app = _agent_app()

    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
    ) as client:
        response = await client.post("/agent/chat", json=_chat_body())

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert '"type":"error"' in response.text
    assert UI_STREAM_ERROR_TEXT in response.text
    assert "[DONE]" not in response.text
    assert "provider secret response" not in caplog.text
