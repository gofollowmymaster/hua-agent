from pathlib import Path
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.database import get_db
from python_api.schemas.common import PageRequest
from python_api.schemas.rag_admin import (
    DocumentMetadataRequest,
    DocumentPageRequest,
    IngestRequest,
    SessionPageRequest,
)
from python_api.security import require_bearer
from python_api.services.documents import DocumentIngestService
from python_api.services.rag_admin import RagAdminService

router = APIRouter(
    prefix="/ai/rag/admin", tags=["RAG 管理后台"], dependencies=[Depends(require_bearer)]
)


@router.post("/documents/page")
async def page_documents(
    body: DocumentPageRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages tenant RAG documents."""
    return await RagAdminService(db).page_documents(body)


@router.get("/documents/{document_id}")
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Returns one tenant RAG document."""
    return await RagAdminService(db).get_document(document_id)


@router.post("/documents/upload")
async def upload_documents(
    files: list[UploadFile] = File(...), db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Stores and indexes at most twenty uploaded documents."""
    return await DocumentIngestService(db).upload(files)


@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Deletes one tenant RAG document."""
    return await RagAdminService(db).delete_document(document_id)


@router.post("/documents/{document_id}/metadata")
async def update_metadata(
    document_id: int, body: DocumentMetadataRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Updates document business metadata."""
    return await RagAdminService(db).update_metadata(document_id, body)


@router.post("/documents/{document_id}/chunks/page")
async def page_chunks(
    document_id: int, body: PageRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages chunks for one RAG document."""
    return await RagAdminService(db).page_chunks(document_id, body)


@router.get("/documents/{document_id}/preview")
async def preview_document(document_id: int, db: AsyncSession = Depends(get_db)) -> FileResponse:
    """Streams the original document with compatible inline headers."""
    path, document = await RagAdminService(db).preview_file(document_id)
    media = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "txt": "text/plain; charset=utf-8",
        "md": "text/markdown; charset=utf-8",
    }.get(document.file_type.lower(), "application/octet-stream")
    fallback = "".join(
        character if " " <= character <= "~" and character != '"' else "_"
        for character in document.file_name
    )
    return FileResponse(
        Path(path),
        media_type=media,
        headers={
            "Content-Disposition": f"inline; filename=\"{fallback}\"; filename*=UTF-8''{quote(document.file_name)}",
            "x-skip-transform": "1",
        },
    )


@router.post("/ingest")
async def ingest(body: IngestRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Indexes documents from the configured tenant raw directory."""
    return await DocumentIngestService(db).ingest_rag(force=body.force)


@router.post("/sessions/page")
async def page_sessions(
    body: SessionPageRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Pages tenant RAG sessions."""
    return await RagAdminService(db).page_sessions(body)


@router.get("/sessions/{session_id}/messages")
async def list_messages(
    session_id: int, db: AsyncSession = Depends(get_db)
) -> list[dict[str, Any]]:
    """Returns ordered messages for one RAG session."""
    return await RagAdminService(db).list_messages(session_id)
