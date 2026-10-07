from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.database import get_db
from python_api.core.resources import get_app_settings
from python_api.core.stream import stream_response
from python_api.modules.agent.chat.memory import AgentMemoryService
from python_api.modules.agent.chat.schemas import AgentSessionPageRequest, ChatRequest
from python_api.modules.agent.chat.service import AgentChatService
from python_api.modules.auth.dependencies import require_composite_auth

router = APIRouter(prefix="/agent/chat", tags=["业务 Agent Chat"])


@router.post("")
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
    identity: dict[str, Any] = Depends(require_composite_auth),
) -> StreamingResponse:
    """Streams one business Agent response using the AI SDK protocol."""
    raw_user_id = identity.get("userId")
    user_id = raw_user_id if isinstance(raw_user_id, int) and not isinstance(raw_user_id, bool) else None
    events = await AgentChatService(
        db, settings=settings, user_id=user_id
    ).prepare_stream(body)
    return stream_response(events, stream_name="agent_chat")


@router.post("/sessions/page")
async def page_sessions(
    body: AgentSessionPageRequest,
    db: AsyncSession = Depends(get_db),
    _identity: dict[str, Any] = Depends(require_composite_auth),
) -> dict[str, Any]:
    """Pages current-tenant Agent sessions."""
    return await AgentMemoryService(db).page_sessions(body)


@router.get("/sessions/{session_id}/messages")
async def list_session_messages(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    _identity: dict[str, Any] = Depends(require_composite_auth),
) -> list[dict[str, Any]]:
    """Returns ordered messages for one tenant-owned Agent session."""
    return await AgentMemoryService(db).list_messages(session_id)
