from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.database import get_db
from python_api.schemas.agent_knowledge import (
    AgentDocumentPageRequest,
    AgentKnowledgeIngestRequest,
    AgentKnowledgeSearchRequest,
)
from python_api.schemas.common import PageRequest
from python_api.security import require_bearer
from python_api.services.agent_knowledge import AgentKnowledgeService

router = APIRouter(
    prefix="/agent/knowledge", tags=["业务 Agent 知识库"], dependencies=[Depends(require_bearer)]
)


@router.post("/ingest")
async def ingest(
    body: AgentKnowledgeIngestRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Indexes current-tenant Agent Markdown files."""
    return await AgentKnowledgeService(db).ingest(body.force)


@router.post("/search")
async def search(
    body: AgentKnowledgeSearchRequest, db: AsyncSession = Depends(get_db)
) -> list[dict[str, Any]]:
    """Searches Agent knowledge using the selected mode."""
    return await AgentKnowledgeService(db).search(body)


@router.get("/documents")
async def page_documents(
    query: AgentDocumentPageRequest = Depends(), db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages current-tenant Agent documents."""
    return await AgentKnowledgeService(db).page_documents(query)


@router.get("/documents/{document_id}")
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Returns one Agent document."""
    return await AgentKnowledgeService(db).get_document(document_id)


@router.post("/documents/{document_id}/chunks/page")
async def page_chunks(
    document_id: int, body: PageRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages chunks for one Agent document."""
    return await AgentKnowledgeService(db).page_chunks(document_id, body)


@router.get("/documents/{document_id}/preview")
async def preview(document_id: int, db: AsyncSession = Depends(get_db)) -> FileResponse:
    """Streams one Markdown source document."""
    path, document = await AgentKnowledgeService(db).preview_file(document_id)
    fallback = "".join(
        character if " " <= character <= "~" and character != '"' else "_"
        for character in document.file_name
    )
    return FileResponse(
        path,
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": f"inline; filename=\"{fallback}\"; filename*=UTF-8''{quote(document.file_name)}",
            "x-skip-transform": "1",
        },
    )


@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Deletes one Agent document."""
    return await AgentKnowledgeService(db).delete_document(document_id)
