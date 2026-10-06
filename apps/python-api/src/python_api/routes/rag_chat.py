from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.database import get_db
from python_api.schemas.chat import ChatRequest
from python_api.security import require_bearer
from python_api.services.rag_chat import RagChatService
from python_api.ui_stream import stream_response

router = APIRouter(prefix="/ai/rag", tags=["RAG 企业知识库"])


@router.post("/chat", dependencies=[Depends(require_bearer)])
async def chat(body: ChatRequest, db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    """Streams a RAG answer using the AI SDK UI Message protocol."""
    return stream_response(RagChatService(db).stream(body))
