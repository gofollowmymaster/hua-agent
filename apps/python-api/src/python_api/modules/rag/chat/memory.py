from __future__ import annotations

import base64
import json
import secrets
import time
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime
from typing import Any, cast

from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.context import get_request_context
from python_api.core.session import ResolvedSession
from python_api.integrations.redis import RAG_SESSION_MEMORY, RedisService
from python_api.modules.rag.models import AplusRagMessage
from python_api.modules.rag.repository import RagRepository


class RagMemoryService:
    """Shares RAG short-term Redis memory and long-term PostgreSQL history."""

    def __init__(
        self,
        db: AsyncSession,
        redis: RedisService,
        clock: Callable[[], float] = time.time,
        now: Callable[[], datetime] | None = None,
    ) -> None:
        self.db = db
        self.redis = redis
        self.clock = clock
        self.now = now or (lambda: datetime.now(UTC))
        self.repository = RagRepository(db)

    def resolve(
        self, conversation_id: str | None, participant_id: str | None, message_id: str | None
    ) -> ResolvedSession:
        """Builds the stable web conversation key used by NestJS."""
        conversation_type = "rag-chat"
        if conversation_id and participant_id:
            session_key = f"{conversation_type}:{conversation_id.strip()}:{participant_id.strip()}"
        elif conversation_id:
            session_key = f"{conversation_type}:{conversation_id.strip()}"
        else:
            session_key = f"request:{int(self.clock() * 1000)}:{secrets.token_urlsafe(6)[:8]}"
        return ResolvedSession(
            get_request_context().tenant_code,
            "web",
            session_key,
            conversation_id,
            conversation_type,
            participant_id,
            message_id,
            {"source": "rag-chat"},
        )

    async def load(self, session: ResolvedSession) -> list[dict[str, Any]]:
        """Loads valid short-term messages and ignores corrupt entries."""
        values = await cast(
            Awaitable[list[Any]], self.redis.client.lrange(self._key(session), 0, -1)
        )
        result = []
        for value in values:
            try:
                parsed = json.loads(value)
                if parsed.get("role") in {"user", "assistant"} and isinstance(
                    parsed.get("content"), str
                ):
                    result.append(parsed)
            except (TypeError, json.JSONDecodeError):
                continue
        return result

    async def append(self, session: ResolvedSession, role: str, content: str) -> None:
        """Appends one message to both shared memory stores."""
        if not content.strip():
            return
        now = self.now()
        metadata = {
            **session.metadata,
            "channel": session.channel,
            "conversationId": session.conversation_id,
            "conversationType": session.conversation_type,
        }
        if role == "user":
            metadata.update(
                {"participantId": session.participant_id, "messageId": session.message_id}
            )
        else:
            metadata.update(
                {
                    "answeredParticipantId": session.participant_id,
                    "replyToMessageId": session.message_id,
                }
            )
        memory = {
            "role": role,
            "content": content,
            "createdAt": now.isoformat().replace("+00:00", "Z"),
            "metadata": metadata,
        }
        key = self._key(session)
        await cast(
            Awaitable[int],
            self.redis.client.rpush(
                key, json.dumps(memory, ensure_ascii=False, separators=(",", ":"))
            ),
        )
        await cast(Awaitable[str], self.redis.client.ltrim(key, -20, -1))
        await cast(Awaitable[bool], self.redis.client.expire(key, 172_800))
        session_id = await self.repository.upsert_session(session)
        self.db.add(
            AplusRagMessage(
                tenant_code=session.tenant_code,
                session_id=session_id,
                role=role,
                content=content,
                sender_id=session.participant_id if role == "user" else "rag-assistant",
                external_message_id=session.message_id if role == "user" else None,
                reply_to_message_id=session.message_id if role == "assistant" else None,
                metadata_=metadata,
            )
        )
        await self.db.commit()

    @staticmethod
    def _key(session: ResolvedSession) -> str:
        """Builds the shared tenant-scoped Redis memory key for a RAG session."""
        encoded = base64.urlsafe_b64encode(session.session_key.encode()).decode().rstrip("=")
        return (
            RAG_SESSION_MEMORY.replace("{tenant}", session.tenant_code)
            .replace("{channel}", session.channel)
            .replace("{sessionKey}", encoded)
        )
