from typing import Any, cast

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession
from python_api.modules.agent.chat.event_adapter import CumulativeDeltaNormalizer
from python_api.modules.agent.chat.schemas import ChatRequest
from python_api.modules.agent.chat.service import AgentChatService
from python_api.modules.agent.chat.tools import current_time


class FakeRuntime:
    """Provides deterministic normalized events without a model call."""

    async def stream(self, _messages: list[Any], _skills: list[Any]):
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

    def __init__(self, *, fail_assistant: bool = False) -> None:
        self.appended: list[dict[str, Any]] = []
        self.recent_calls = 0
        self.fail_assistant = fail_assistant

    def resolve(self, conversation_id: str, participant_id: str | None, message_id: str | None):
        return ResolvedSession(
            "aplus", "agent-web", "key", conversation_id, "agent-chat", participant_id, message_id
        )

    async def recent(self, _session: ResolvedSession, _limit: int):
        self.recent_calls += 1
        return []

    async def append(
        self, _session: ResolvedSession, role: str, content: str, tool_calls=None, parts=None
    ):
        if role == "assistant" and self.fail_assistant:
            raise RuntimeError("assistant persistence failed")
        self.appended.append(
            {"role": role, "content": content, "toolCalls": tool_calls, "parts": parts}
        )


class ReloadingSkills:
    """Returns a distinct instruction on every Agent run."""

    def __init__(self) -> None:
        self.calls = 0

    async def list_enabled_instructions(self):
        self.calls += 1
        return [
            {
                "key": f"user:{self.calls}",
                "type": "user",
                "name": "动态规则",
                "instruction": f"版本 {self.calls}",
            }
        ]


class RecordingRuntime:
    """Records the ordered Skill input passed to each runtime invocation."""

    def __init__(self) -> None:
        self.skills: list[list[Any]] = []

    async def stream(self, _messages: list[Any], skills: list[Any]):
        self.skills.append(skills)
        yield {"type": "done", "answer": "完成", "toolCalls": []}


class FailingSkills:
    """Fails while loading the required pre-stream Skill state."""

    async def list_enabled_instructions(self):
        """Raises before an Agent event iterator can be returned."""
        raise RuntimeError("agent_user_skills query failed")


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

    stream = await service.prepare_stream(request)
    events = [event async for event in stream]
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


@pytest.mark.asyncio
async def test_agent_reloads_skills_for_every_run_and_ignores_participant_id() -> None:
    runtime = RecordingRuntime()
    skills = ReloadingSkills()
    memory = FakeMemory()
    service = AgentChatService(
        cast(AsyncSession, None),
        lambda _db: cast(Any, runtime),
        memory=cast(Any, memory),
        user_id=7,
        skill_service=cast(Any, skills),
    )
    request = ChatRequest.model_validate(
        {
            "id": "conversation-1",
            "participantId": "999",
            "messages": [
                {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "执行"}]}
            ],
        }
    )

    for expected_calls in range(1, 3):
        stream = await service.prepare_stream(request)
        assert skills.calls == expected_calls
        assert memory.recent_calls == expected_calls
        assert len(runtime.skills) == expected_calls - 1
        _ = [event async for event in stream]

    assert skills.calls == 2
    assert runtime.skills[0][0]["instruction"] == "版本 1"
    assert runtime.skills[1][0]["instruction"] == "版本 2"


@pytest.mark.asyncio
async def test_agent_preparation_failure_happens_before_streaming() -> None:
    runtime = RecordingRuntime()
    memory = FakeMemory()
    service = AgentChatService(
        cast(AsyncSession, None),
        lambda _db: cast(Any, runtime),
        memory=cast(Any, memory),
        skill_service=cast(Any, FailingSkills()),
    )
    request = ChatRequest.model_validate(
        {
            "id": "conversation-1",
            "messages": [
                {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "执行"}]}
            ],
        }
    )

    with pytest.raises(RuntimeError, match="agent_user_skills query failed"):
        await service.prepare_stream(request)

    assert memory.recent_calls == 1
    assert runtime.skills == []


@pytest.mark.asyncio
async def test_agent_does_not_emit_done_when_assistant_persistence_fails() -> None:
    memory = FakeMemory(fail_assistant=True)
    service = AgentChatService(
        cast(AsyncSession, None),
        lambda _db: cast(Any, FakeRuntime()),
        memory=cast(Any, memory),
    )
    request = ChatRequest.model_validate(
        {
            "id": "conversation-1",
            "messages": [
                {"id": "message-1", "role": "user", "parts": [{"type": "text", "text": "执行"}]}
            ],
        }
    )
    stream = await service.prepare_stream(request)
    events: list[dict[str, Any]] = []

    with pytest.raises(RuntimeError, match="assistant persistence failed"):
        async for event in stream:
            events.append(event)

    assert all(event.get("data", {}).get("stage") != "done" for event in events)
