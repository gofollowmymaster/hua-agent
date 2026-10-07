from __future__ import annotations

from copy import deepcopy
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.context import get_request_context
from python_api.core.schemas import json_value
from python_api.core.session import ResolvedSession
from python_api.modules.agent.chat.schemas import AgentSessionPageRequest
from python_api.modules.agent.models import AgentChatMessage, AgentChatSession
from python_api.modules.agent.repository import AgentRepository


class AgentMemoryService:
    """Shares Agent session and ordered message persistence with NestJS."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = AgentRepository(db)

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
        session_id = await self.repository.upsert_chat_session(session)
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

    async def find_a2ui_surface(
        self, session: ResolvedSession, surface_id: str
    ) -> dict[str, Any] | None:
        """Loads a tenant-owned persisted A2UI surface by its opaque identifier."""
        found = await self.db.scalar(
            select(AgentChatSession).where(
                AgentChatSession.tenant_code == session.tenant_code,
                AgentChatSession.channel == session.channel,
                AgentChatSession.session_key == session.session_key,
            )
        )
        if not found:
            return None
        messages = (
            await self.db.scalars(
                select(AgentChatMessage)
                .where(
                    AgentChatMessage.tenant_code == session.tenant_code,
                    AgentChatMessage.session_id == found.id,
                )
                .order_by(AgentChatMessage.created_at.desc())
            )
        ).all()
        for message in messages:
            for part in message.parts or []:
                if not isinstance(part, dict):
                    continue
                data = part.get("data")
                if part.get("type") == "data-a2ui" and isinstance(data, dict) and data.get("surfaceId") == surface_id:
                    return deepcopy(data)
        return None

    async def append_a2ui_command(
        self, session: ResolvedSession, surface_id: str, command: dict[str, Any]
    ) -> bool:
        """Appends one validated update command to its tenant-owned persisted surface."""
        found = await self.db.scalar(
            select(AgentChatSession).where(
                AgentChatSession.tenant_code == session.tenant_code,
                AgentChatSession.channel == session.channel,
                AgentChatSession.session_key == session.session_key,
            )
        )
        if not found:
            return False
        messages = (
            await self.db.scalars(
                select(AgentChatMessage)
                .where(
                    AgentChatMessage.tenant_code == session.tenant_code,
                    AgentChatMessage.session_id == found.id,
                )
                .order_by(AgentChatMessage.created_at.desc())
            )
        ).all()
        for message in messages:
            parts = deepcopy(message.parts or [])
            for part in parts:
                if not isinstance(part, dict):
                    continue
                data = part.get("data")
                if part.get("type") == "data-a2ui" and isinstance(data, dict) and data.get("surfaceId") == surface_id:
                    commands = data.get("commands")
                    if not isinstance(commands, list):
                        return False
                    commands.append(command)
                    message.parts = parts
                    await self.db.commit()
                    return True
        return False

