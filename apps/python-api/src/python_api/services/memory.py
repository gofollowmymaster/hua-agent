from __future__ import annotations

import base64
import json
import secrets
import time
from collections.abc import Awaitable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, cast

from sqlalchemy import func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.context import get_request_context
from python_api.core.redis.redis_service import RAG_SESSION_MEMORY, redis_service
from python_api.models import AgentChatMessage, AgentChatSession, AplusRagMessage
from python_api.schemas.chat import AgentSessionPageRequest
from python_api.schemas.common import json_value


@dataclass(slots=True)
class ResolvedSession:
    """Carries stable identifiers shared by memory and persistence layers."""

    tenant_code: str
    channel: str
    session_key: str
    conversation_id: str | None
    conversation_type: str | None
    participant_id: str | None
    message_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class RagMemoryService:
    """Shares RAG short-term Redis memory and long-term PostgreSQL history."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

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
            session_key = f"request:{int(time.time() * 1000)}:{secrets.token_urlsafe(6)[:8]}"
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
            Awaitable[list[Any]], redis_service.client.lrange(self._key(session), 0, -1)
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
        now = datetime.now(UTC)
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
            redis_service.client.rpush(
                key, json.dumps(memory, ensure_ascii=False, separators=(",", ":"))
            ),
        )
        await cast(Awaitable[str], redis_service.client.ltrim(key, -20, -1))
        await cast(Awaitable[bool], redis_service.client.expire(key, 172_800))
        session_id = await self._upsert(session)
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

    async def _upsert(self, session: ResolvedSession) -> int:
        """Creates or refreshes the durable RAG session and returns its identifier."""
        result = await self.db.execute(
            text(
                """INSERT INTO aplus_rag_sessions (tenant_code,channel,session_key,user_id,conversation_id,conversation_type,metadata,last_active_at,updated_at) VALUES (:tenant,:channel,:key,:user_id,:conversation_id,:conversation_type,CAST(:metadata AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,channel,session_key) DO UPDATE SET user_id=EXCLUDED.user_id,conversation_id=EXCLUDED.conversation_id,conversation_type=EXCLUDED.conversation_type,metadata=EXCLUDED.metadata,last_active_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP RETURNING id"""
            ),
            {
                "tenant": session.tenant_code,
                "channel": session.channel,
                "key": session.session_key,
                "user_id": session.participant_id,
                "conversation_id": session.conversation_id,
                "conversation_type": session.conversation_type,
                "metadata": json.dumps(session.metadata),
            },
        )
        return int(result.scalar_one())

    @staticmethod
    def _key(session: ResolvedSession) -> str:
        """Builds the shared tenant-scoped Redis memory key for a RAG session."""
        encoded = base64.urlsafe_b64encode(session.session_key.encode()).decode().rstrip("=")
        return (
            RAG_SESSION_MEMORY.replace("{tenant}", session.tenant_code)
            .replace("{channel}", session.channel)
            .replace("{sessionKey}", encoded)
        )


class AgentMemoryService:
    """Shares Agent session and ordered message persistence with NestJS."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def resolve(
        self, conversation_id: str, participant_id: str | None, message_id: str | None
    ) -> ResolvedSession:
        """Builds the Agent web session key used by NestJS."""
        participant = participant_id or "anonymous"
        return ResolvedSession(
            get_request_context().tenant_code,
            "agent-web",
            f"conversation:{conversation_id}:user:{participant}",
            conversation_id,
            "agent-chat",
            participant_id,
            message_id,
            {"source": "agent-demo"},
        )

    async def recent(self, session: ResolvedSession, limit: int = 10) -> list[dict[str, str]]:
        """Loads recent user and assistant messages in chronological order."""
        found = await self.db.scalar(
            select(AgentChatSession).where(
                AgentChatSession.tenant_code == session.tenant_code,
                AgentChatSession.channel == session.channel,
                AgentChatSession.session_key == session.session_key,
            )
        )
        if not found:
            return []
        messages = (
            await self.db.scalars(
                select(AgentChatMessage)
                .where(AgentChatMessage.session_id == found.id)
                .order_by(AgentChatMessage.created_at.desc())
                .limit(limit)
            )
        ).all()
        return [
            {"role": item.role, "content": item.content}
            for item in reversed(messages)
            if item.role in {"user", "assistant"}
        ]

    async def append(
        self,
        session: ResolvedSession,
        role: str,
        content: str,
        tool_calls: list[dict[str, Any]] | None = None,
        parts: list[dict[str, Any]] | None = None,
    ) -> None:
        """Persists one Agent message and refreshes session activity."""
        session_id = await self._upsert(session)
        metadata = {
            "channel": session.channel,
            "conversationId": session.conversation_id,
            "conversationType": session.conversation_type,
            "participantId": session.participant_id,
            **session.metadata,
        }
        self.db.add(
            AgentChatMessage(
                tenant_code=session.tenant_code,
                session_id=session_id,
                role=role,
                content=content,
                tool_calls=tool_calls or [],
                parts=parts,
                sender_id=session.participant_id if role == "user" else None,
                external_message_id=session.message_id if role == "user" else None,
                reply_to_message_id=session.message_id if role == "assistant" else None,
                metadata_=metadata,
            )
        )
        await self.db.commit()

    async def page_sessions(self, request: AgentSessionPageRequest) -> dict[str, Any]:
        """Pages Agent sessions with latest-message summaries."""
        tenant = get_request_context().tenant_code
        filters: list[Any] = [AgentChatSession.tenant_code == tenant]
        if request.channel:
            filters.append(AgentChatSession.channel == request.channel)
        if request.conversation_type:
            filters.append(AgentChatSession.conversation_type == request.conversation_type)
        if request.user_id:
            filters.append(AgentChatSession.user_id == request.user_id)
        if request.keyword and request.keyword.strip():
            pattern = f"%{request.keyword.strip()}%"
            filters.append(
                or_(
                    AgentChatSession.session_key.like(pattern),
                    AgentChatSession.conversation_id.like(pattern),
                )
            )
        total = await self.db.scalar(
            select(func.count()).select_from(AgentChatSession).where(*filters)
        )
        sessions = (
            await self.db.scalars(
                select(AgentChatSession)
                .where(*filters)
                .order_by(AgentChatSession.last_active_at.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        output = []
        for session in sessions:
            count = await self.db.scalar(
                select(func.count())
                .select_from(AgentChatMessage)
                .where(AgentChatMessage.session_id == session.id)
            )
            latest = await self.db.scalar(
                select(AgentChatMessage)
                .where(AgentChatMessage.session_id == session.id)
                .order_by(AgentChatMessage.created_at.desc())
                .limit(1)
            )
            output.append(
                json_value(
                    {
                        "id": str(session.id),
                        "tenantCode": session.tenant_code,
                        "channel": session.channel,
                        "sessionKey": session.session_key,
                        "userId": session.user_id,
                        "conversationId": session.conversation_id,
                        "conversationType": session.conversation_type,
                        "metadata": session.metadata_,
                        "messageCount": count or 0,
                        "latestMessage": None
                        if not latest
                        else {
                            "id": str(latest.id),
                            "role": latest.role,
                            "content": latest.content,
                            "createdAt": latest.created_at,
                        },
                        "createdAt": session.created_at,
                        "updatedAt": session.updated_at,
                        "lastActiveAt": session.last_active_at,
                    }
                )
            )
        return {
            "list": output,
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def list_messages(self, session_id: int) -> list[dict[str, Any]]:
        """Returns ordered messages or an empty list for a foreign session."""
        tenant = get_request_context().tenant_code
        session = await self.db.scalar(
            select(AgentChatSession).where(
                AgentChatSession.id == session_id, AgentChatSession.tenant_code == tenant
            )
        )
        if not session:
            return []
        messages = (
            await self.db.scalars(
                select(AgentChatMessage)
                .where(
                    AgentChatMessage.session_id == session_id,
                    AgentChatMessage.tenant_code == tenant,
                )
                .order_by(AgentChatMessage.created_at)
            )
        ).all()
        return [
            json_value(
                {
                    "id": str(item.id),
                    "tenantCode": item.tenant_code,
                    "sessionId": str(item.session_id),
                    "role": item.role,
                    "content": item.content,
                    "toolCalls": item.tool_calls,
                    "parts": item.parts,
                    "senderId": item.sender_id,
                    "externalMessageId": item.external_message_id,
                    "replyToMessageId": item.reply_to_message_id,
                    "metadata": item.metadata_,
                    "createdAt": item.created_at,
                }
            )
            for item in messages
        ]

    async def _upsert(self, session: ResolvedSession) -> int:
        """Creates or refreshes the durable Agent session and returns its identifier."""
        result = await self.db.execute(
            text(
                """INSERT INTO agent_chat_sessions (tenant_code,channel,session_key,user_id,conversation_id,conversation_type,metadata,last_active_at,updated_at) VALUES (:tenant,:channel,:key,:user_id,:conversation_id,:conversation_type,CAST(:metadata AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,channel,session_key) DO UPDATE SET user_id=EXCLUDED.user_id,conversation_id=EXCLUDED.conversation_id,conversation_type=EXCLUDED.conversation_type,metadata=EXCLUDED.metadata,last_active_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP RETURNING id"""
            ),
            {
                "tenant": session.tenant_code,
                "channel": session.channel,
                "key": session.session_key,
                "user_id": session.participant_id,
                "conversation_id": session.conversation_id,
                "conversation_type": session.conversation_type,
                "metadata": json.dumps(session.metadata),
            },
        )
        return int(result.scalar_one())
