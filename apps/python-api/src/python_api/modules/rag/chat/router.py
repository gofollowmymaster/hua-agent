from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.database import get_db
from python_api.core.resources import get_app_settings, get_redis
from python_api.core.stream import stream_response
from python_api.integrations.redis import RedisService
from python_api.modules.auth.dependencies import require_bearer
from python_api.modules.rag.chat.schemas import ChatRequest
from python_api.modules.rag.chat.service import RagChatService

router = APIRouter(prefix="/ai/rag", tags=["RAG 企业知识库"])


@router.post("/chat", dependencies=[Depends(require_bearer)])
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    redis: RedisService = Depends(get_redis),
    settings: Settings = Depends(get_app_settings),
) -> StreamingResponse:
    """Streams a RAG answer using the AI SDK UI Message protocol."""
    return stream_response(RagChatService(db, redis, settings).stream(body))
