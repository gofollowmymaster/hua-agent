from __future__ import annotations

import json
from collections.abc import AsyncIterator, Callable
from typing import Any
from uuid import uuid4

from fastapi import HTTPException
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.context import get_request_context
from python_api.modules.agent.chat.memory import AgentMemoryService
from python_api.modules.agent.chat.runtime import (
    FALLBACK_ANSWER,
    AgentChatRuntime,
)
from python_api.modules.agent.chat.schemas import ChatRequest
from python_api.modules.agent.skills.service import AgentSkillService


class AgentChatService:
    """Orchestrates validated Agent requests, ordered UI events, and persistence."""

    def __init__(
        self,
        db: AsyncSession,
        runtime_factory: Callable[[AsyncSession], AgentChatRuntime] | None = None,
        settings: Settings | None = None,
        memory: AgentMemoryService | None = None,
        user_id: int | None = None,
        skill_service: AgentSkillService | None = None,
    ) -> None:
        self.memory = memory or AgentMemoryService(db)
        self.runtime = (
            runtime_factory(db)
            if runtime_factory is not None
            else AgentChatRuntime(db, settings=settings)
        )
        self.skills = skill_service or AgentSkillService(
            db, get_request_context().tenant_code, user_id
        )

    def stream(self, request: ChatRequest) -> AsyncIterator[dict[str, Any]]:
        """Validates synchronously and returns the ordered UI event iterator."""
        question_id, question = self._latest_question(request)
        conversation_id = request.id.strip() if request.id and request.id.strip() else str(uuid4())

        async def events() -> AsyncIterator[dict[str, Any]]:
            """Translates runtime events into ordered UI events and persists the turn."""
            session = self.memory.resolve(conversation_id, request.participant_id, question_id)
            parts: list[dict[str, Any]] = []
            yield self._status(parts, "analyze_start", "开始分析问题")
            history = await self.memory.recent(session, 10)
            skills = await self.skills.list_enabled_instructions()
            messages: list[BaseMessage] = [
                HumanMessage(item["content"])
                if item["role"] == "user"
                else AIMessage(item["content"])
                for item in history
            ]
            messages.append(HumanMessage(question))
            answer = ""
            tool_calls: list[dict[str, Any]] = []
            active_reasoning: str | None = None
            active_text: str | None = None
            generation_started = False
            has_text = False

            async for event in self.runtime.stream(messages, skills):
                event_type = event["type"]
                if event_type == "reasoning_delta":
                    if active_text:
                        yield {"type": "text-end", "id": active_text}
                        active_text = None
                    if not active_reasoning:
                        active_reasoning = str(uuid4())
                        yield {"type": "reasoning-start", "id": active_reasoning}
                    yield {
                        "type": "reasoning-delta",
                        "id": active_reasoning,
                        "delta": event["delta"],
                    }
                    self._append_text_part(parts, "reasoning", event["delta"])
                elif event_type == "tool_start":
                    if active_reasoning:
                        yield {"type": "reasoning-end", "id": active_reasoning}
                        active_reasoning = None
                    if active_text:
                        yield {"type": "text-end", "id": active_text}
                        active_text = None
                    yield self._status(
                        parts, "tool_call", f"调用工具：{event['name']}", tool=event["name"]
                    )
                elif event_type == "tool_end":
                    tool_call = {key: event[key] for key in ("name", "arguments", "result")}
                    tool_calls.append(tool_call)
                    yield self._status(
                        parts,
                        "tool_result",
                        self._tool_summary(tool_call),
                        tool=event["name"],
                        arguments=event["arguments"],
                        result=event["result"],
                    )
                elif event_type == "text_delta":
                    if active_reasoning:
                        yield {"type": "reasoning-end", "id": active_reasoning}
                        active_reasoning = None
                    if not generation_started:
                        generation_started = True
                        yield self._status(parts, "generate_start", "开始生成答案")
                    if not active_text:
                        active_text = str(uuid4())
                        yield {"type": "text-start", "id": active_text}
                    has_text = True
                    answer += event["delta"]
                    yield {"type": "text-delta", "id": active_text, "delta": event["delta"]}
                    self._append_text_part(parts, "text", event["delta"])
                elif event_type == "done":
                    answer = event.get("answer") or answer
                    tool_calls = event.get("toolCalls") or tool_calls

            if not answer:
                answer = FALLBACK_ANSWER
            if not has_text:
                if active_reasoning:
                    yield {"type": "reasoning-end", "id": active_reasoning}
                    active_reasoning = None
                yield self._status(parts, "generate_start", "开始生成答案")
                active_text = str(uuid4())
                yield {"type": "text-start", "id": active_text}
                yield {"type": "text-delta", "id": active_text, "delta": answer}
                self._append_text_part(parts, "text", answer)
            if active_text:
                yield {"type": "text-end", "id": active_text}
            if active_reasoning:
                yield {"type": "reasoning-end", "id": active_reasoning}
            yield self._status(parts, "done", "生成完成")
            await self.memory.append(session, "user", question)
            await self.memory.append(session, "assistant", answer, tool_calls, parts)

        return events()

    @staticmethod
    def _latest_question(request: ChatRequest) -> tuple[str | None, str]:
        """Extracts the latest non-empty user text or raises a stable input error."""
        if not request.messages:
            raise HTTPException(400, "messages is required")
        message = next((item for item in reversed(request.messages) if item.role == "user"), None)
        question = (
            ""
            if not message
            else "".join(part.text or "" for part in message.parts if part.type == "text").strip()
        )
        if not question:
            raise HTTPException(400, "question text is required")
        if message is None:
            raise HTTPException(400, "question text is required")
        return message.id, question

    @staticmethod
    def _status(
        parts: list[dict[str, Any]], stage: str, message: str, **extra: Any
    ) -> dict[str, Any]:
        """Appends and returns one visible status event for ordered persistence."""
        data = {"stage": stage, "message": message, **extra}
        parts.append({"type": "data-status", "data": data})
        return {"type": "data-status", "data": data}

    @staticmethod
    def _append_text_part(parts: list[dict[str, Any]], part_type: str, value: str) -> None:
        """Merges only adjacent text of the same type in persisted message parts."""
        if parts and parts[-1].get("type") == part_type:
            parts[-1]["text"] += value
        else:
            parts.append({"type": part_type, "text": value})

    @staticmethod
    def _tool_summary(tool_call: dict[str, Any]) -> str:
        """Builds a concise user-visible summary without discarding the full result."""
        name = tool_call["name"]
        try:
            value = json.loads(tool_call["result"])
        except (TypeError, json.JSONDecodeError):
            value = None
        if name == "search_knowledge" and isinstance(value, list):
            if not value:
                return "未检索到相关文档"
            names = [
                str(item.get("fileName"))
                for item in value
                if isinstance(item, dict) and item.get("fileName")
            ]
            return f"检索到 {len(value)} 个相关文档" + (
                f"：{'、'.join(names[:3])}{' 等' if len(value) > 3 else ''}" if names else ""
            )
        if name == "get_document" and isinstance(value, dict) and value.get("fileName"):
            return f"已获取文档：{value['fileName']}"
        if name == "get_document_chunks" and isinstance(value, dict):
            return f"已获取 {len(value.get('list') or [])}/{value.get('total', 0)} 个文档切片"
        return f"工具执行完成：{name}"
