from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import HTTPException
from sqlalchemy import exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings, get_settings
from python_api.core.context import get_request_context
from python_api.core.schemas import PageRequest, json_value
from python_api.modules.rag.admin_schemas import (
    DocumentMetadataRequest,
    DocumentPageRequest,
    SessionPageRequest,
)
from python_api.modules.rag.models import (
    AplusChunk,
    AplusDocument,
    AplusRagMessage,
    AplusRagSession,
)


class RagAdminService:
    """Provides tenant-scoped RAG document, chunk, and session operations."""

    def __init__(self, db: AsyncSession, settings: Settings | None = None) -> None:
        self.db = db
        self.settings = settings or get_settings()
        self.tenant = get_request_context().tenant_code

    async def page_documents(self, request: DocumentPageRequest) -> dict[str, Any]:
        """Returns filtered documents with their actual chunk counts."""
        filters: list[Any] = [AplusDocument.tenant_code == self.tenant]
        if request.keyword and request.keyword.strip():
            keyword = f"%{request.keyword.strip()}%"
            filters.append(
                or_(
                    AplusDocument.file_name.ilike(keyword), AplusDocument.source_path.ilike(keyword)
                )
            )
        if request.status and request.status.strip():
            filters.append(AplusDocument.status == request.status.strip())
        if request.updated_from:
            filters.append(AplusDocument.updated_at >= request.updated_from)
        if request.updated_to:
            filters.append(AplusDocument.updated_at <= request.updated_to)
        return await self._document_page(filters, request)

    async def get_document(self, document_id: int) -> dict[str, Any]:
        """Returns one tenant-owned document."""
        document = await self.db.scalar(
            select(AplusDocument).where(
                AplusDocument.id == document_id, AplusDocument.tenant_code == self.tenant
            )
        )
        if not document:
            raise HTTPException(400, f"Document #{document_id} not found")
        count = await self.db.scalar(
            select(func.count())
            .select_from(AplusChunk)
            .where(AplusChunk.document_id == document_id, AplusChunk.tenant_code == self.tenant)
        )
        return self._serialize_document(document, count or 0)

    async def update_metadata(
        self, document_id: int, request: DocumentMetadataRequest
    ) -> dict[str, Any]:
        """Updates normalized type and tag metadata."""
        document = await self._owned_document(document_id)
        document.type = request.type.strip() if request.type else ""
        document.tag = request.tag.strip() if request.tag else ""
        document.updated_at = func.now()
        await self.db.commit()
        await self.db.refresh(document)
        return json_value(
            {
                "id": str(document.id),
                "tenantCode": document.tenant_code,
                "type": document.type,
                "tag": document.tag,
                "updatedAt": document.updated_at,
            }
        )

    async def delete_document(self, document_id: int) -> dict[str, Any]:
        """Deletes a tenant-owned document and cascading chunks."""
        document = await self._owned_document(document_id)
        result = {
            "deleted": {
                "id": str(document.id),
                "tenantCode": document.tenant_code,
                "sourcePath": document.source_path,
            }
        }
        await self.db.delete(document)
        await self.db.commit()
        return result

    async def page_chunks(self, document_id: int, request: PageRequest) -> dict[str, Any]:
        """Returns ordered chunks for a tenant-owned document."""
        await self._owned_document(document_id)
        filters = [AplusChunk.document_id == document_id, AplusChunk.tenant_code == self.tenant]
        total = await self.db.scalar(select(func.count()).select_from(AplusChunk).where(*filters))
        chunks = (
            await self.db.scalars(
                select(AplusChunk)
                .where(*filters)
                .order_by(AplusChunk.chunk_index)
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        return {
            "list": [
                json_value(
                    {
                        "id": str(item.id),
                        "tenantCode": item.tenant_code,
                        "documentId": str(item.document_id),
                        "chunkIndex": item.chunk_index,
                        "content": item.content,
                        "metadata": item.metadata_,
                        "createdAt": item.created_at,
                    }
                )
                for item in chunks
            ],
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def preview_file(self, document_id: int) -> tuple[Path, AplusDocument]:
        """Resolves a document only inside its tenant raw directory."""
        document = await self._owned_document(document_id)
        root = (self.settings.workspace_root / self.settings.raw_dir).resolve()
        tenant_root = (root / self.tenant).resolve()
        candidates = [
            (tenant_root / document.source_path).resolve(),
            (self.settings.workspace_root / document.source_path).resolve(),
        ]
        for candidate in candidates:
            if self._inside(candidate, tenant_root) and candidate.is_file():
                return candidate, document
        raise HTTPException(400, "Document preview file not found")

    async def page_sessions(self, request: SessionPageRequest) -> dict[str, Any]:
        """Returns filtered sessions with count and latest-message summary."""
        filters: list[Any] = [AplusRagSession.tenant_code == self.tenant]
        if request.channel and request.channel.strip():
            filters.append(AplusRagSession.channel == request.channel.strip())
        if request.conversation_id and request.conversation_id.strip():
            filters.append(
                AplusRagSession.conversation_id.ilike(f"%{request.conversation_id.strip()}%")
            )
        if request.conversation_type and request.conversation_type.strip():
            filters.append(AplusRagSession.conversation_type == request.conversation_type.strip())
        if request.user_id and request.user_id.strip():
            filters.append(AplusRagSession.user_id.ilike(f"%{request.user_id.strip()}%"))
        if request.active_from:
            filters.append(AplusRagSession.last_active_at >= request.active_from)
        if request.active_to:
            filters.append(AplusRagSession.last_active_at <= request.active_to)
        if request.keyword and request.keyword.strip():
            keyword = f"%{request.keyword.strip()}%"
            message_match = exists(
                select(AplusRagMessage.id).where(
                    AplusRagMessage.session_id == AplusRagSession.id,
                    AplusRagMessage.content.ilike(keyword),
                )
            )
            filters.append(
                or_(
                    AplusRagSession.session_key.ilike(keyword),
                    AplusRagSession.conversation_id.ilike(keyword),
                    AplusRagSession.user_id.ilike(keyword),
                    message_match,
                )
            )
        total = await self.db.scalar(
            select(func.count()).select_from(AplusRagSession).where(*filters)
        )
        sessions = (
            await self.db.scalars(
                select(AplusRagSession)
                .where(*filters)
                .order_by(AplusRagSession.last_active_at.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        result = []
        for session in sessions:
            count = await self.db.scalar(
                select(func.count())
                .select_from(AplusRagMessage)
                .where(AplusRagMessage.session_id == session.id)
            )
            latest = await self.db.scalar(
                select(AplusRagMessage)
                .where(AplusRagMessage.session_id == session.id)
                .order_by(AplusRagMessage.created_at.desc())
                .limit(1)
            )
            result.append(
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
            "list": result,
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def list_messages(self, session_id: int) -> list[dict[str, Any]]:
        """Returns all messages only after confirming tenant ownership."""
        session = await self.db.scalar(
            select(AplusRagSession).where(
                AplusRagSession.id == session_id, AplusRagSession.tenant_code == self.tenant
            )
        )
        if not session:
            raise HTTPException(400, f"Session #{session_id} not found")
        messages = (
            await self.db.scalars(
                select(AplusRagMessage)
                .where(
                    AplusRagMessage.session_id == session_id,
                    AplusRagMessage.tenant_code == self.tenant,
                )
                .order_by(AplusRagMessage.created_at)
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
                    "senderId": item.sender_id,
                    "externalMessageId": item.external_message_id,
                    "replyToMessageId": item.reply_to_message_id,
                    "metadata": item.metadata_,
                    "createdAt": item.created_at,
                }
            )
            for item in messages
        ]

    async def _document_page(self, filters: list[Any], request: PageRequest) -> dict[str, Any]:
        """Pages filtered documents and attaches each actual chunk count."""
        total = await self.db.scalar(
            select(func.count()).select_from(AplusDocument).where(*filters)
        )
        documents = (
            await self.db.scalars(
                select(AplusDocument)
                .where(*filters)
                .order_by(AplusDocument.updated_at.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        result = []
        for document in documents:
            count = await self.db.scalar(
                select(func.count())
                .select_from(AplusChunk)
                .where(AplusChunk.document_id == document.id)
            )
            result.append(self._serialize_document(document, count or 0))
        return {
            "list": result,
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def _owned_document(self, document_id: int) -> AplusDocument:
        """Loads one RAG document only when it belongs to the current tenant."""
        document = await self.db.scalar(
            select(AplusDocument).where(
                AplusDocument.id == document_id, AplusDocument.tenant_code == self.tenant
            )
        )
        if not document:
            raise HTTPException(400, f"Document #{document_id} not found")
        return document

    def _serialize_document(self, document: AplusDocument, actual_count: int) -> dict[str, Any]:
        """Maps a RAG document and measured chunk count to the API contract."""
        return json_value(
            {
                "id": str(document.id),
                "tenantCode": document.tenant_code,
                "sourcePath": document.source_path,
                "fileName": document.file_name,
                "fileType": document.file_type,
                "type": document.type,
                "tag": document.tag,
                "fileHash": document.file_hash,
                "fileSize": str(document.file_size),
                "chunkCount": document.chunk_count,
                "actualChunkCount": actual_count,
                "status": document.status,
                "error": document.error,
                "createdAt": document.created_at,
                "updatedAt": document.updated_at,
                "ingestedAt": document.ingested_at,
            }
        )

    @staticmethod
    def _inside(path: Path, parent: Path) -> bool:
        """Checks whether a resolved preview path remains under its allowed root."""
        try:
            path.relative_to(parent)
            return True
        except ValueError:
            return False
