from __future__ import annotations

import ast
import json
import operator
from collections.abc import AsyncIterator, Callable
from datetime import datetime
from typing import Any
from uuid import uuid4
from zoneinfo import ZoneInfo

from deepagents import (
    GeneralPurposeSubagentProfile,
    HarnessProfile,
    create_deep_agent,
    register_harness_profile,
)
from fastapi import HTTPException
from langchain.agents.middleware import ToolCallLimitMiddleware
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.tools import BaseTool, tool
from langchain_openai import ChatOpenAI
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.config import get_settings
from python_api.schemas.agent_knowledge import AgentKnowledgeSearchRequest
from python_api.schemas.chat import ChatRequest
from python_api.schemas.common import PageRequest
from python_api.schemas.ds_order import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
    DsOrderLogPageRequest,
    DsOrderPageRequest,
)
from python_api.services.agent_knowledge import AgentKnowledgeService
from python_api.services.ds_order import DsOrderService
from python_api.services.memory import AgentMemoryService

EXCLUDED_BUILTIN_TOOLS = frozenset(
    {"write_todos", "ls", "read_file", "write_file", "edit_file", "glob", "grep", "execute", "task"}
)
MISSING_TOOL_OUTPUT = "工具执行完成，但未返回可展示结果"
FALLBACK_ANSWER = "抱歉，我暂时无法生成回答，请稍后重试。"

SYSTEM_PROMPT = """你是业务 Agent 助手，可以调用工具获取业务知识库内容、文档详情、一件代发订单、当前时间和计算结果。
规则：
1. 业务问题优先调用 search_knowledge，必要时调用 get_document 查看详情。
2. 只基于工具返回的资料回答，不编造业务事实。
3. 引用资料时给出文档名或路径。
4. 用户询问时间时调用 get_current_time，需要计算时调用 calculate。
5. 用户询问一件代发订单时，按需调用 list_ds_orders、get_ds_order 或 list_ds_order_logs。
6. 只有用户明确要求审核或取消指定订单时，才能调用 audit_ds_order 或 cancel_ds_order；仅查询状态时不得执行写操作。
7. 工具结果不足时明确说明资料未覆盖，不猜测。
8. 当系统输出用户可见的思考过程时，仅使用简体中文。
9. 只能使用 SDK 提供的原生工具调用，不得用 XML、Markdown 或文本模拟工具调用。"""


class CumulativeDeltaNormalizer:
    """Converts cumulative provider snapshots into non-duplicated deltas."""

    def __init__(self) -> None:
        self._values: dict[str, str] = {}

    def normalize(self, channel: str, value: str) -> str:
        """Returns only unseen text while preserving independent channels."""
        if not value:
            return ""
        previous = self._values.get(channel, "")
        if value == previous:
            return ""
        if value.startswith(previous):
            delta = value[len(previous) :]
            self._values[channel] = value
            return delta
        self._values[channel] = previous + value
        return value


class AgentChatRuntime:
    """Builds business tools and adapts Deep Agents events to a stable event model."""

    def __init__(self, db: AsyncSession) -> None:
        self.knowledge = AgentKnowledgeService(db)
        self.orders = DsOrderService()
        self._agent: Any | None = None

    async def stream(self, messages: list[BaseMessage]) -> AsyncIterator[dict[str, Any]]:
        """Yields normalized reasoning, tool, text, and completion events."""
        agent = self._get_agent()
        active_tools: dict[str, dict[str, Any]] = {}
        tool_calls: list[dict[str, Any]] = []
        answer = ""
        normalizer = CumulativeDeltaNormalizer()

        async for event in agent.astream_events({"messages": messages}, version="v2"):
            event_type = str(event.get("event", ""))
            data = event.get("data") or {}
            if event_type == "on_chat_model_stream":
                for channel, value in self._message_parts(data.get("chunk")):
                    delta = normalizer.normalize(channel, value)
                    if not delta:
                        continue
                    if channel == "text":
                        answer += delta
                        yield {"type": "text_delta", "delta": delta}
                    else:
                        yield {"type": "reasoning_delta", "delta": delta}
                continue

            run_id = str(event.get("run_id", ""))
            if event_type == "on_tool_start":
                name = self._tool_name(event)
                arguments = self._normalize_input(data.get("input"))
                active_tools[run_id] = {"name": name, "arguments": arguments}
                yield {"type": "tool_start", "name": name, "arguments": arguments}
                continue

            if event_type in {"on_tool_end", "on_tool_error"}:
                current = active_tools.pop(
                    run_id,
                    {"name": self._tool_name(event), "arguments": {}},
                )
                output = data.get("output") if event_type == "on_tool_end" else data.get("error")
                record = {**current, "result": self._normalize_result(output)}
                tool_calls.append(record)
                yield {"type": "tool_end", **record}

        yield {"type": "done", "answer": answer, "toolCalls": tool_calls}

    def _get_agent(self) -> Any:
        if self._agent is not None:
            return self._agent
        settings = get_settings()
        register_harness_profile(
            "openai",
            HarnessProfile(
                excluded_tools=EXCLUDED_BUILTIN_TOOLS,
                general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False),
            ),
        )
        model = ChatOpenAI(
            model=settings.model_name,
            temperature=0.5,
            api_key=SecretStr(settings.openai_api_key),
            base_url=settings.openai_base_url,
        )
        self._agent = create_deep_agent(
            model=model,
            tools=self._build_tools(),
            system_prompt=SYSTEM_PROMPT,
            middleware=[ToolCallLimitMiddleware(run_limit=5, exit_behavior="continue")],
            subagents=[],
        )
        return self._agent

    def _build_tools(self) -> list[BaseTool]:
        knowledge = self.knowledge
        orders = self.orders

        @tool
        async def search_knowledge(query: str, category: str | None = None, top_k: int = 8) -> str:
            """Search the tenant business knowledge base."""
            hits = await knowledge.search(
                AgentKnowledgeSearchRequest(query=query, category=category, topK=top_k)
            )
            visible = [
                {
                    **{
                        key: hit.get(key)
                        for key in (
                            "documentId",
                            "category",
                            "fileName",
                            "sourcePath",
                            "remoteUrl",
                            "breadcrumb",
                            "score",
                        )
                    },
                    "content": str(hit.get("content", ""))[:1200],
                }
                for hit in hits
            ]
            return self._json(visible)

        @tool
        async def get_document(document_id: int | str) -> str:
            """Get one tenant knowledge document."""
            document = await knowledge.get_document(int(document_id))
            keys = (
                "id",
                "category",
                "fileName",
                "sourcePath",
                "status",
                "chunkCount",
                "actualChunkCount",
                "breadcrumb",
                "remoteUrl",
                "updatedAt",
            )
            return self._json({key: document.get(key) for key in keys})

        @tool
        async def get_document_chunks(
            document_id: int | str, page: int = 1, page_size: int = 10
        ) -> str:
            """Page chunks belonging to one tenant knowledge document."""
            result = await knowledge.page_chunks(
                int(document_id), PageRequest(page=page, pageSize=page_size)
            )
            return self._json(
                {
                    "total": result["total"],
                    "list": [
                        {**item, "content": str(item.get("content", ""))[:1200]}
                        for item in result["list"]
                    ],
                }
            )

        @tool
        def get_current_time() -> str:
            """Get current Asia/Shanghai date and time."""
            return datetime.now(ZoneInfo("Asia/Shanghai")).strftime("%Y年%m月%d日 %A %H:%M:%S")

        @tool
        def calculate(expression: str) -> str:
            """Safely calculate an arithmetic expression."""
            return self._json({"expression": expression, "result": _calculate(expression)})

        @tool
        def list_ds_orders(page: int = 1, page_size: int = 10, status: str | None = None) -> str:
            """Page tenant drop-shipping orders."""
            payload: dict[str, Any] = {"page": page, "pageSize": page_size}
            if status:
                payload["statusList"] = status
            return self._json(orders.page(DsOrderPageRequest.model_validate(payload)))

        @tool
        def get_ds_order(ds_order_no: str, query_available_quantity: int = 0) -> str:
            """Get one drop-shipping order."""
            request = DsOrderInfoRequest.model_validate(
                {
                    "dsOrderNo": ds_order_no,
                    "queryAvailableQuantity": query_available_quantity,
                }
            )
            return self._json(orders.info(request))

        @tool
        def list_ds_order_logs(ds_order_no: str, page: int = 1, page_size: int = 10) -> str:
            """Page operation logs for one drop-shipping order."""
            request = DsOrderLogPageRequest.model_validate(
                {"dsOrderNo": ds_order_no, "page": page, "pageSize": page_size}
            )
            return self._json(orders.log_page(request))

        @tool
        def audit_ds_order(ds_order_no: str, passed: int, message: str | None = None) -> str:
            """Approve or reject a drop-shipping order audit."""
            request = DsOrderAuditRequest.model_validate(
                {"dsOrderNo": ds_order_no, "passed": passed, "msg": message}
            )
            return self._json(orders.audit(request))

        @tool
        def cancel_ds_order(ds_order_no: str, cancel_message: str) -> str:
            """Submit cancellation for a drop-shipping order."""
            request = DsOrderCancelRequest.model_validate(
                {"dsOrderNo": ds_order_no, "cancelMsg": cancel_message}
            )
            return self._json(orders.cancel(request))

        return [
            search_knowledge,
            get_document,
            get_document_chunks,
            get_current_time,
            calculate,
            list_ds_orders,
            get_ds_order,
            list_ds_order_logs,
            audit_ds_order,
            cancel_ds_order,
        ]

    @staticmethod
    def _message_parts(chunk: Any) -> list[tuple[str, str]]:
        blocks = getattr(chunk, "content_blocks", None)
        if isinstance(blocks, list):
            result = []
            for block in blocks:
                if not isinstance(block, dict):
                    continue
                block_type = str(block.get("type", ""))
                value = block.get("text") or block.get("reasoning") or block.get("content")
                if isinstance(value, str) and block_type in {"text", "reasoning"}:
                    result.append((block_type, value))
            if result:
                return result
        content = getattr(chunk, "content", "")
        return [("text", content)] if isinstance(content, str) and content else []

    @staticmethod
    def _tool_name(event: dict[str, Any]) -> str:
        name = str(event.get("name") or "").strip()
        if name:
            return name
        metadata = event.get("metadata") or {}
        recovered = str(metadata.get("tool_name") or metadata.get("name") or "").strip()
        return recovered or "unknown_tool"

    @staticmethod
    def _normalize_input(value: Any) -> dict[str, Any]:
        if isinstance(value, str):
            try:
                return AgentChatRuntime._normalize_input(json.loads(value))
            except json.JSONDecodeError:
                return {}
        if not isinstance(value, dict):
            return {}
        for wrapper in ("args", "kwargs", "input"):
            if isinstance(value.get(wrapper), dict):
                return AgentChatRuntime._normalize_input(value[wrapper])
        return value

    @staticmethod
    def _normalize_result(value: Any) -> str:
        if value is None:
            return MISSING_TOOL_OUTPUT
        content = getattr(value, "content", value)
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return "".join(
                str(item.get("text", "")) if isinstance(item, dict) else str(item)
                for item in content
            )
        return AgentChatRuntime._json(content)

    @staticmethod
    def _json(value: Any) -> str:
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"), default=str)


class AgentChatService:
    """Orchestrates validated Agent requests, ordered UI events, and persistence."""

    def __init__(
        self,
        db: AsyncSession,
        runtime_factory: Callable[[AsyncSession], AgentChatRuntime] = AgentChatRuntime,
    ) -> None:
        self.memory = AgentMemoryService(db)
        self.runtime = runtime_factory(db)

    def stream(self, request: ChatRequest) -> AsyncIterator[dict[str, Any]]:
        """Validates synchronously and returns the ordered UI event iterator."""
        question_id, question = self._latest_question(request)
        conversation_id = request.id.strip() if request.id and request.id.strip() else str(uuid4())

        async def events() -> AsyncIterator[dict[str, Any]]:
            session = self.memory.resolve(conversation_id, request.participant_id, question_id)
            parts: list[dict[str, Any]] = []
            yield self._status(parts, "analyze_start", "开始分析问题")
            history = await self.memory.recent(session, 10)
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

            async for event in self.runtime.stream(messages):
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
        data = {"stage": stage, "message": message, **extra}
        parts.append({"type": "data-status", "data": data})
        return {"type": "data-status", "data": data}

    @staticmethod
    def _append_text_part(parts: list[dict[str, Any]], part_type: str, value: str) -> None:
        if parts and parts[-1].get("type") == part_type:
            parts[-1]["text"] += value
        else:
            parts.append({"type": part_type, "text": value})

    @staticmethod
    def _tool_summary(tool_call: dict[str, Any]) -> str:
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


_BINARY_OPERATORS: dict[type[ast.operator], Callable[[float, float], float]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}
_UNARY_OPERATORS: dict[type[ast.unaryop], Callable[[float], float]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _calculate(expression: str) -> int | float:
    """Evaluates only numeric literals and basic arithmetic operators."""
    if len(expression) > 200:
        raise ValueError("表达式过长")

    def evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.BinOp) and type(node.op) in _BINARY_OPERATORS:
            return _BINARY_OPERATORS[type(node.op)](evaluate(node.left), evaluate(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPERATORS:
            return _UNARY_OPERATORS[type(node.op)](evaluate(node.operand))
        raise ValueError("只支持数字、括号和 + - * / 运算")

    result = evaluate(ast.parse(expression, mode="eval"))
    return int(result) if result.is_integer() else result
