from pathlib import Path
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.database import get_db
from python_api.core.resources import get_app_settings
from python_api.core.schemas import PageRequest
from python_api.modules.auth.dependencies import require_bearer
from python_api.modules.digital_avatar.schemas import (
    DigitalAvatarDocumentPageRequest,
    DigitalAvatarSummaryRequest,
)
from python_api.modules.digital_avatar.service import DigitalAvatarDocumentService

router = APIRouter(
    prefix="/digital-avatar/admin",
    tags=["数字分身文档管理"],
    dependencies=[Depends(require_bearer)],
)


@router.post("/documents/page")
async def page_documents(
    body: DigitalAvatarDocumentPageRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Pages globally shared digital avatar documents."""
    return await DigitalAvatarDocumentService(db, settings).page_documents(body)


@router.get("/documents/{document_id}")
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Returns one digital avatar document."""
    return await DigitalAvatarDocumentService(db, settings).get_document(document_id)


@router.post("/documents/upload")
async def upload_documents(
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Stores and indexes at most twenty UTF-8 txt files."""
    return await DigitalAvatarDocumentService(db, settings).upload(files)


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, bool]:
    """Deletes one digital avatar document and its chunks."""
    return await DigitalAvatarDocumentService(db, settings).delete_document(document_id)


@router.post("/documents/{document_id}/summary")
async def update_summary(
    document_id: int,
    body: DigitalAvatarSummaryRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Updates the administrator-maintained document summary."""
    return await DigitalAvatarDocumentService(db, settings).update_summary(
        document_id, body.summary
    )


@router.post("/documents/{document_id}/chunks/page")
async def page_chunks(
    document_id: int,
    body: PageRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Pages fixed chunks for one digital avatar document."""
    return await DigitalAvatarDocumentService(db, settings).page_chunks(document_id, body)


@router.get("/documents/{document_id}/preview")
async def preview_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> FileResponse:
    """Streams the original UTF-8 txt document inline."""
    path, document = await DigitalAvatarDocumentService(db, settings).preview_file(document_id)
    fallback = "".join(
        character if " " <= character <= "~" and character != '"' else "_"
        for character in document.file_name
    )
    return FileResponse(
        Path(path),
        media_type="text/plain; charset=utf-8",
        headers={
            "Content-Disposition": f"inline; filename=\"{fallback}\"; filename*=UTF-8''{quote(document.file_name)}",
            "x-skip-transform": "1",
        },
    )


@router.post("/documents/{document_id}/reingest")
async def reingest_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Rebuilds chunks and the derived summary from the stored source."""
    return await DigitalAvatarDocumentService(db, settings).reingest(document_id)
