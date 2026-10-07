from __future__ import annotations

import re
import uuid
from collections.abc import AsyncIterator
from typing import Any

from fastapi import HTTPException
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings, get_settings
from python_api.core.session import ResolvedSession
from python_api.integrations.embeddings import create_embeddings
from python_api.integrations.redis import RedisService
from python_api.modules.rag.chat.memory import RagMemoryService
from python_api.modules.rag.chat.schemas import ChatRequest
from python_api.modules.rag.repository import RagRepository


class RagChatService:
    """Runs the compatible RAG retrieval, generation, streaming and memory flow."""

    def __init__(
        self,
        db: AsyncSession,
        redis: RedisService,
        settings: Settings | None = None,
        model: Any | None = None,
        fallback_model: Any | None = None,
        embeddings: Any | None = None,
        memory: RagMemoryService | None = None,
    ) -> None:
        self.db = db
        self.settings = settings or get_settings()
        self.memory = memory or RagMemoryService(db, redis)
        self.repository = RagRepository(db)
        self.model = model or ChatOpenAI(
            model=self.settings.model_name,
            api_key=self.settings.require_openai_key(),
            base_url=self.settings.openai_base_url,
            streaming=True,
            model_kwargs={"reasoning_effort": self.settings.rag_reasoning_effort},
        )
        self.fallback_model = fallback_model or ChatOpenAI(
            model=self.settings.model_name,
            api_key=self.settings.require_openai_key(),
            base_url=self.settings.openai_base_url,
            streaming=True,
        )
        self.embeddings = embeddings or create_embeddings(self.settings)

    async def prepare_stream(self, request: ChatRequest) -> AsyncIterator[dict[str, Any]]:
        """Loads required history and persists the user turn before streaming starts."""
        question_id, question = self._question(request)
        conversation_id = (
            request.id.strip() if request.id and request.id.strip() else str(uuid.uuid4())
        )
        participant = (
            request.participant_id.strip()
            if request.participant_id and request.participant_id.strip()
            else None
        )
        session = self.memory.resolve(conversation_id, participant, question_id)
        history = await self.memory.load(session)
        await self.memory.append(session, "user", question)
        direct = self._is_direct(question)
        return self._stream_prepared(session, question, history, direct)

    async def _stream_prepared(
        self,
        session: ResolvedSession,
        question: str,
        history: list[dict[str, Any]],
        direct: bool,
    ) -> AsyncIterator[dict[str, Any]]:
        """Emits RAG events and reports completion only after assistant persistence."""
        chunks: list[dict[str, Any]] = []
        if not direct:
            yield {
                "type": "data-status",
                "data": {
                    "stage": "analyzing_start",
                    "message": "开始分析问题",
                    "sessionKey": session.session_key,
                },
            }
            yield {
                "type": "data-status",
                "data": {
                    "stage": "retrieve_start",
                    "message": "开始检索知识库",
                    "sessionKey": session.session_key,
                },
            }
            chunks = await self._retrieve(
                question, session.tenant_code, self.settings.rag_default_top_k
            )
            yield {
                "type": "data-status",
                "data": {
                    "stage": "retrieve_done",
                    "message": f"检索完成，命中 {len(chunks)} 个片段",
                    "sessionKey": session.session_key,
                    "chunks": len(chunks),
                },
            }
        yield {
            "type": "data-status",
            "data": {
                "stage": "generate_start",
                "message": "开始生成答案",
                "sessionKey": session.session_key,
                "chunks": len(chunks),
            },
        }
        prompt = self._prompt(question, history, chunks)
        reasoning_id, text_id = str(uuid.uuid4()), str(uuid.uuid4())
        reasoning_started = False
        text_started = False
        answer = ""
        try:
            model = self.fallback_model if direct else self.model
            async for chunk in model.astream([HumanMessage(content=prompt)]):
                reasoning = self._reasoning(chunk)
                if reasoning:
                    if not reasoning_started:
                        reasoning_started = True
                        yield {"type": "reasoning-start", "id": reasoning_id}
                    yield {"type": "reasoning-delta", "id": reasoning_id, "delta": reasoning}
                content = self._content(chunk.content)
                if not content:
                    continue
                if reasoning_started:
                    yield {"type": "reasoning-end", "id": reasoning_id}
                    reasoning_started = False
                if not text_started:
                    text_started = True
                    yield {"type": "text-start", "id": text_id}
                answer += content
                yield {"type": "text-delta", "id": text_id, "delta": content}
        except Exception:
            yield {
                "type": "data-status",
                "data": {
                    "stage": "fallback_start",
                    "message": "流式生成未返回文本，切换为普通生成",
                    "sessionKey": session.session_key,
                    "chunks": len(chunks),
                },
            }
            response = await self.fallback_model.ainvoke([HumanMessage(content=prompt)])
            answer = self._content(response.content)
        if reasoning_started:
            yield {"type": "reasoning-end", "id": reasoning_id}
        if not answer:
            answer = "抱歉，我暂时无法生成回答，请稍后重试。"
        if not text_started:
            yield {"type": "text-start", "id": text_id}
            yield {"type": "text-delta", "id": text_id, "delta": answer}
        yield {"type": "text-end", "id": text_id}
        await self.memory.append(session, "assistant", answer)
        yield {"type": "data-status", "data": {"stage": "done", "message": "生成完成"}}

    async def _retrieve(self, query: str, tenant: str, top_k: int) -> list[dict[str, Any]]:
        """Fuses tenant-scoped full-text and vector candidates using reciprocal rank."""
        candidate_limit = min(top_k * 2, 100)
        keyword_rows = await self.repository.search_keyword_chunks(
            query, tenant, candidate_limit
        )
        vector_rows = await self.repository.search_vector_chunks(
            await self.embeddings.aembed_query(query), tenant, candidate_limit
        )
        merged: dict[str, dict[str, Any]] = {}
        for route, rows in (("keyword", keyword_rows), ("vector", vector_rows)):
            for rank, row in enumerate(rows):
                key = str(row["id"])
                current = merged.setdefault(key, {**dict(row), "fused": 0.0, "routes": []})
                current["fused"] += 1 / (self.settings.rag_fusion_k + rank + 1)
                current["routes"].append(route)
        values = sorted(
            merged.values(),
            key=lambda item: (item["fused"], float(item.get("score") or 0)),
            reverse=True,
        )
        return values[:top_k]

    @staticmethod
    def _question(request: ChatRequest) -> tuple[str | None, str]:
        """Returns the latest non-empty user question and its message identifier."""
        for message in reversed(request.messages):
            if message.role == "user":
                value = "".join(
                    part.text or "" for part in message.parts if part.type == "text"
                ).strip()
                if value:
                    return message.id, value
        raise HTTPException(
            400, "question text is required" if request.messages else "messages is required"
        )

    @staticmethod
    def _is_direct(question: str) -> bool:
        """Detects greetings that can bypass knowledge retrieval."""
        return bool(
            re.fullmatch(
                r"[\s,.!?，。！？]*(你好|您好|hi|hello|谢谢|thanks)[\s,.!?，。！？]*",
                question,
                re.I,
            )
        )

    @staticmethod
    def _prompt(question: str, history: list[dict[str, Any]], chunks: list[dict[str, Any]]) -> str:
        """Builds either a direct-chat or evidence-grounded generation prompt."""
        memory = "\n".join(f"{item['role']}: {item['content']}" for item in history[-10:]) or "无"
        if not chunks:
            return f"你是企业知识助手。简洁、准确地回答用户。\n对话历史：\n{memory}\n用户问题：{question}"
        context = "\n\n".join(
            f"[{index + 1}] {item['file_name']} ({item['source_path']})\n{item['content']}"
            for index, item in enumerate(chunks)
        )
        return f"你是企业知识库问答助手。只能根据资料回答；资料不足时明确说明，不得编造。引用时写出文件名。\n对话历史：\n{memory}\n资料：\n{context}\n问题：{question}"

    @staticmethod
    def _reasoning(chunk: Any) -> str:
        """Extracts provider-specific reasoning text from a model chunk."""
        value = getattr(chunk, "additional_kwargs", {}).get("reasoning_content") or getattr(
            chunk, "additional_kwargs", {}
        ).get("reasoning")
        return value if isinstance(value, str) else ""

    @staticmethod
    def _content(content: Any) -> str:
        """Normalizes string or block-list model content into plain text."""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            return "".join(
                item.get("text", "")
                for item in content
                if isinstance(item, dict) and isinstance(item.get("text"), str)
            )
        return ""
