from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

from fastapi.responses import StreamingResponse

UI_STREAM_HEADERS = {
    "cache-control": "no-cache",
    "connection": "keep-alive",
    "x-vercel-ai-ui-message-stream": "v1",
    "x-accel-buffering": "no",
    "x-skip-transform": "1",
}


def encode_event(event: dict[str, Any]) -> bytes:
    """Encodes one AI SDK v6 UI Message event as an SSE data line."""
    return f"data: {json.dumps(event, ensure_ascii=False, separators=(',', ':'))}\n\n".encode()


def stream_response(events: AsyncIterator[dict[str, Any]]) -> StreamingResponse:
    """Wraps normalized events with the exact AI SDK stream headers and terminator."""

    async def body() -> AsyncIterator[bytes]:
        async for event in events:
            yield encode_event(event)
        yield b"data: [DONE]\n\n"

    return StreamingResponse(body(), media_type="text/event-stream", headers=UI_STREAM_HEADERS)
