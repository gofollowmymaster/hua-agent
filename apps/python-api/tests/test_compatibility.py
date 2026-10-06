import json

import pytest

from python_api.core.context import RequestContext, reset_request_context, set_request_context
from python_api.core.stream import UI_STREAM_HEADERS, encode_event
from python_api.integrations.redis import RAG_SESSION_MEMORY, RedisService
from python_api.modules.auth.dependencies import hash_password, verify_password


@pytest.mark.asyncio
async def test_scrypt_hash_round_trip_and_rejects_invalid_password() -> None:
    value = await hash_password("correct horse battery staple")

    assert value.startswith("scrypt$")
    assert await verify_password("correct horse battery staple", value)
    assert not await verify_password("wrong", value)


def test_redis_key_preserves_shared_tenant_template() -> None:
    token = set_request_context(RequestContext(tenant_code="boat"))
    try:
        service = RedisService(None)  # type: ignore[arg-type]
        assert (
            service.build_key(RAG_SESSION_MEMORY, channel="web", sessionKey="encoded")
            == "frontend-node:boat:rag:memory:web:encoded"
        )
    finally:
        reset_request_context(token)


def test_ui_stream_encoding_and_headers_are_ai_sdk_compatible() -> None:
    encoded = encode_event({"type": "text-delta", "id": "1", "delta": "你好"})

    assert encoded == b'data: {"type":"text-delta","id":"1","delta":"\xe4\xbd\xa0\xe5\xa5\xbd"}\n\n'
    assert UI_STREAM_HEADERS["cache-control"] == "no-cache, no-transform"
    assert UI_STREAM_HEADERS["x-vercel-ai-ui-message-stream"] == "v1"
    assert UI_STREAM_HEADERS["x-accel-buffering"] == "no"
    assert json.loads(encoded.removeprefix(b"data: ").strip()) == {
        "type": "text-delta",
        "id": "1",
        "delta": "你好",
    }
