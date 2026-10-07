from typing import Any, cast

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession
from python_api.integrations.redis import RedisService
from python_api.modules.rag.chat.schemas import ChatRequest
from python_api.modules.rag.chat.service import RagChatService


class FakeChunk:
    """Provides the model chunk fields consumed by the RAG service."""

    def __init__(self, content: str) -> None:
        self.content = content
        self.additional_kwargs: dict[str, Any] = {}


class FakeModel:
    """Produces one deterministic direct-chat response."""

    async def astream(self, _messages: list[Any]):
        """Yields a single text chunk without external model access."""
        yield FakeChunk("答案")

    async def ainvoke(self, _messages: list[Any]) -> FakeChunk:
        """Returns the same answer for the fallback path."""
        return FakeChunk("答案")


class FakeRagMemory:
    """Records RAG preparation and persistence operations."""

    def __init__(self, *, fail_load: bool = False, fail_assistant: bool = False) -> None:
        self.fail_load = fail_load
        self.fail_assistant = fail_assistant
        self.calls: list[str] = []

    def resolve(
        self, conversation_id: str, participant_id: str | None, message_id: str | None
    ) -> ResolvedSession:
        """Returns a stable fake session and records synchronous resolution."""
        self.calls.append("resolve")
        return ResolvedSession(
            "aplus",
            "web",
            "rag-chat:conversation-1",
            conversation_id,
            "rag-chat",
            participant_id,
            message_id,
        )

    async def load(self, _session: ResolvedSession) -> list[dict[str, Any]]:
        """Loads history or raises the configured preparation failure."""
        self.calls.append("load")
        if self.fail_load:
            raise RuntimeError("rag history unavailable")
        return [{"role": "assistant", "content": "历史答案"}]

    async def append(self, _session: ResolvedSession, role: str, _content: str) -> None:
        """Records message persistence and optionally fails the assistant write."""
        self.calls.append(f"append:{role}")
        if role == "assistant" and self.fail_assistant:
            raise RuntimeError("assistant persistence failed")


def _request() -> ChatRequest:
    """Builds a direct-chat request that bypasses retrieval dependencies."""
    return ChatRequest.model_validate(
        {
            "id": "conversation-1",
            "messages": [
                {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "你好"}]}
            ],
        }
    )


def _service(memory: FakeRagMemory) -> RagChatService:
    """Creates a RAG service with all external providers replaced by fakes."""
    model = FakeModel()
    return RagChatService(
        cast(AsyncSession, None),
        cast(RedisService, None),
        model=model,
        fallback_model=model,
        embeddings=object(),
        memory=cast(Any, memory),
    )


@pytest.mark.asyncio
async def test_rag_prepares_history_and_user_message_before_streaming() -> None:
    memory = FakeRagMemory()

    stream = await _service(memory).prepare_stream(_request())

    assert memory.calls == ["resolve", "load", "append:user"]
    events = [event async for event in stream]
    visible = [event.get("data", {}).get("stage") or event["type"] for event in events]
    assert visible == ["generate_start", "text-start", "text-delta", "text-end", "done"]
    assert memory.calls == ["resolve", "load", "append:user", "append:assistant"]


@pytest.mark.asyncio
async def test_rag_preparation_failure_happens_before_streaming() -> None:
    memory = FakeRagMemory(fail_load=True)

    with pytest.raises(RuntimeError, match="rag history unavailable"):
        await _service(memory).prepare_stream(_request())

    assert memory.calls == ["resolve", "load"]


@pytest.mark.asyncio
async def test_rag_does_not_emit_done_when_assistant_persistence_fails() -> None:
    memory = FakeRagMemory(fail_assistant=True)
    stream = await _service(memory).prepare_stream(_request())
    events: list[dict[str, Any]] = []

    with pytest.raises(RuntimeError, match="assistant persistence failed"):
        async for event in stream:
            events.append(event)

    assert all(event.get("data", {}).get("stage") != "done" for event in events)
