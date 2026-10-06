from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.database import get_db
from python_api.core.security import require_composite_auth
from python_api.schemas.chat import AgentSessionPageRequest, ChatRequest
from python_api.services.agent_chat import AgentChatService
from python_api.services.memory import AgentMemoryService
from python_api.ui_stream import stream_response

router = APIRouter(
    prefix="/agent/chat", tags=["业务 Agent Chat"], dependencies=[Depends(require_composite_auth)]
)


@router.post("")
async def chat(body: ChatRequest, db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    """Streams one business Agent response using the AI SDK protocol."""
    return stream_response(AgentChatService(db).stream(body))


@router.post("/sessions/page")
async def page_sessions(
    body: AgentSessionPageRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages current-tenant Agent sessions."""
    return await AgentMemoryService(db).page_sessions(body)


@router.get("/sessions/{session_id}/messages")
async def list_session_messages(
    session_id: int, db: AsyncSession = Depends(get_db)
) -> list[dict[str, Any]]:
    """Returns ordered messages for one tenant-owned Agent session."""
    return await AgentMemoryService(db).list_messages(session_id)
