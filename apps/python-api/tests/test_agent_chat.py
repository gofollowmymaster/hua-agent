from typing import Any, cast

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession
from python_api.modules.agent.chat import AgentChatService
from python_api.modules.agent.event_adapter import CumulativeDeltaNormalizer
from python_api.modules.agent.schemas import ChatRequest
from python_api.modules.agent.tools import current_time


class FakeRuntime:
    """Provides deterministic normalized events without a model call."""

    async def stream(self, _messages: list[Any]):
        yield {"type": "reasoning_delta", "delta": "分析"}
        yield {"type": "tool_start", "name": "search_knowledge", "arguments": {"query": "退款"}}
        yield {
            "type": "tool_end",
            "name": "search_knowledge",
            "arguments": {"query": "退款"},
            "result": '[{"fileName":"退款规则.md"}]',
        }
        yield {"type": "text_delta", "delta": "答案"}
        yield {
            "type": "done",
            "answer": "答案",
            "toolCalls": [
                {
                    "name": "search_knowledge",
                    "arguments": {"query": "退款"},
                    "result": '[{"fileName":"退款规则.md"}]',
                }
            ],
        }


class FakeMemory:
    """Captures persisted messages for event-order assertions."""

    def __init__(self) -> None:
        self.appended: list[dict[str, Any]] = []

    def resolve(self, conversation_id: str, participant_id: str | None, message_id: str | None):
        return ResolvedSession(
            "aplus", "agent-web", "key", conversation_id, "agent-chat", participant_id, message_id
        )

    async def recent(self, _session: ResolvedSession, _limit: int):
        return []

    async def append(
        self, _session: ResolvedSession, role: str, content: str, tool_calls=None, parts=None
    ):
        self.appended.append(
            {"role": role, "content": content, "toolCalls": tool_calls, "parts": parts}
        )


def test_cumulative_delta_normalization_keeps_channels_separate() -> None:
    normalizer = CumulativeDeltaNormalizer()

    assert normalizer.normalize("reasoning", "先") == "先"
    assert normalizer.normalize("reasoning", "先分析") == "分析"
    assert normalizer.normalize("reasoning", "先分析") == ""
    assert normalizer.normalize("text", "先") == "先"


def test_current_time_uses_bundled_shanghai_timezone() -> None:
    value = current_time()

    assert "年" in value
    assert "月" in value
    assert "日" in value


@pytest.mark.asyncio
async def test_agent_stream_and_persisted_parts_preserve_visible_order() -> None:
    service = AgentChatService(cast(AsyncSession, None), lambda _db: cast(Any, FakeRuntime()))
    memory = FakeMemory()
    service.memory = cast(Any, memory)
    request = ChatRequest.model_validate(
        {
            "id": "conversation-1",
            "messages": [
                {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "退款规则"}]}
            ],
        }
    )

    events = [event async for event in service.stream(request)]
    visible = [event.get("data", {}).get("stage") or event["type"] for event in events]

    assert visible == [
        "analyze_start",
        "reasoning-start",
        "reasoning-delta",
        "reasoning-end",
        "tool_call",
        "tool_result",
        "generate_start",
        "text-start",
        "text-delta",
        "text-end",
        "done",
    ]
    assert memory.appended[-1]["parts"] == [
        {"type": "data-status", "data": {"stage": "analyze_start", "message": "开始分析问题"}},
        {"type": "reasoning", "text": "分析"},
        {
            "type": "data-status",
            "data": {
                "stage": "tool_call",
                "message": "调用工具：search_knowledge",
                "tool": "search_knowledge",
            },
        },
        {
            "type": "data-status",
            "data": {
                "stage": "tool_result",
                "message": "检索到 1 个相关文档：退款规则.md",
                "tool": "search_knowledge",
                "arguments": {"query": "退款"},
                "result": '[{"fileName":"退款规则.md"}]',
            },
        },
        {"type": "data-status", "data": {"stage": "generate_start", "message": "开始生成答案"}},
        {"type": "text", "text": "答案"},
        {"type": "data-status", "data": {"stage": "done", "message": "生成完成"}},
    ]
