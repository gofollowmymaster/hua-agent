from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

from fastapi.responses import StreamingResponse

UI_STREAM_HEADERS = {
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-vercel-ai-ui-message-stream": "v1",
    "x-accel-buffering": "no",
    "x-skip-transform": "1",
}
UI_STREAM_ERROR_TEXT = "生成失败，请稍后重试"

logger = logging.getLogger("python_api.stream")


def encode_event(event: dict[str, Any]) -> bytes:
    """Encodes one AI SDK v6 UI Message event as an SSE data line."""
    return f"data: {json.dumps(event, ensure_ascii=False, separators=(',', ':'))}\n\n".encode()


def stream_response(
    events: AsyncIterator[dict[str, Any]], *, stream_name: str
) -> StreamingResponse:
    """Wraps normalized events with the exact AI SDK stream headers and terminator."""

    async def body() -> AsyncIterator[bytes]:
        """Yields events, converts runtime failures, and terminates only successful streams."""
        try:
            async for event in events:
                yield encode_event(event)
        except Exception as error:
            logger.error(
                "ui_message_stream_failed stream=%s exception_type=%s",
                stream_name,
                type(error).__name__,
            )
            yield encode_event({"type": "error", "errorText": UI_STREAM_ERROR_TEXT})
            return
        yield b"data: [DONE]\n\n"

    return StreamingResponse(body(), media_type="text/event-stream", headers=UI_STREAM_HEADERS)
