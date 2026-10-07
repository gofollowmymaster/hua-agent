from __future__ import annotations

import asyncio
import hashlib
import shutil
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile
from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.schemas import PageRequest, json_value
from python_api.integrations.embeddings import create_embeddings
from python_api.modules.digital_avatar.models import (
    DigitalAvatarChunk,
    DigitalAvatarDocument,
)
from python_api.modules.digital_avatar.parser import parse_digital_avatar_text
from python_api.modules.digital_avatar.repository import (
    DigitalAvatarRepository,
    DigitalAvatarSource,
)
from python_api.modules.digital_avatar.schemas import DigitalAvatarDocumentPageRequest


class DigitalAvatarDocumentService:
    """Manages global txt documents, summaries, chunks, and embeddings."""

    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self.db = db
        self.settings = settings
        self.repository = DigitalAvatarRepository(db)
        self.embeddings = create_embeddings(settings)

    @property
    def root(self) -> Path:
        """Returns the global managed digital avatar document directory."""
        return (self.settings.workspace_root / self.settings.raw_dir / "digital-avatar").resolve()

    async def page_documents(self, request: DigitalAvatarDocumentPageRequest) -> dict[str, Any]:
        """Pages global documents without tenant filtering."""
        filters: list[Any] = []
        if request.keyword and request.keyword.strip():
            keyword = f"%{request.keyword.strip()}%"
            filters.append(
                or_(
                    DigitalAvatarDocument.file_name.ilike(keyword),
                    DigitalAvatarDocument.source_path.ilike(keyword),
                    DigitalAvatarDocument.summary.ilike(keyword),
                )
            )
        if request.status:
            filters.append(DigitalAvatarDocument.status == request.status)
        if request.updated_from:
            filters.append(DigitalAvatarDocument.updated_at >= request.updated_from)
        if request.updated_to:
            filters.append(DigitalAvatarDocument.updated_at <= request.updated_to)
        total = await self.db.scalar(
            select(func.count()).select_from(DigitalAvatarDocument).where(*filters)
        )
        documents = (
            await self.db.scalars(
                select(DigitalAvatarDocument)
                .where(*filters)
                .order_by(DigitalAvatarDocument.updated_at.desc(), DigitalAvatarDocument.id.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        return {
            "list": [await self._serialize_with_count(item) for item in documents],
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def get_document(self, document_id: int) -> dict[str, Any]:
        """Returns one global document and its actual chunk count."""
        return await self._serialize_with_count(await self._document(document_id))

    async def page_chunks(self, document_id: int, request: PageRequest) -> dict[str, Any]:
        """Pages ordered chunks after confirming the parent document exists."""
        await self._document(document_id)
        total = await self.db.scalar(
            select(func.count())
            .select_from(DigitalAvatarChunk)
            .where(DigitalAvatarChunk.document_id == document_id)
        )
        chunks = (
            await self.db.scalars(
                select(DigitalAvatarChunk)
                .where(DigitalAvatarChunk.document_id == document_id)
                .order_by(DigitalAvatarChunk.chunk_index)
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        return {
            "list": [
                json_value(
                    {
                        "id": str(item.id),
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

    async def update_summary(self, document_id: int, summary: str) -> dict[str, Any]:
        """Updates the editable summary until the next reingest."""
        document = await self._document(document_id)
        document.summary = summary.strip()
        await self.db.commit()
        return await self.get_document(document_id)

    async def delete_document(self, document_id: int) -> dict[str, bool]:
        """Deletes document metadata and chunks while retaining the source file."""
        await self._document(document_id)
        await self.db.execute(
            delete(DigitalAvatarDocument).where(DigitalAvatarDocument.id == document_id)
        )
        await self.db.commit()
        return {"success": True}

    async def preview_file(self, document_id: int) -> tuple[Path, DigitalAvatarDocument]:
        """Resolves one managed source path without allowing path traversal."""
        document = await self._document(document_id)
        path = (self.root / document.source_path).resolve()
        if not self._inside(path, self.root) or not await asyncio.to_thread(path.is_file):
            raise HTTPException(400, "Original document is unavailable")
        return path, document

    async def reingest(self, document_id: int) -> dict[str, Any]:
        """Rebuilds chunks and overwrites the editable summary from source text."""
        path, _document = await self.preview_file(document_id)
        source = await asyncio.to_thread(self._describe, path, self.root)
        result = await self._process_source(source, force=True)
        if result["status"] == "failed":
            raise HTTPException(500, str(result.get("reason") or "Document reingest failed"))
        return await self.get_document(document_id)

    async def upload(self, files: list[UploadFile]) -> dict[str, Any]:
        """Stores and indexes a bounded batch of txt uploads independently."""
        if not files or len(files) > self.settings.python_api_max_upload_files:
            raise HTTPException(400, "Upload must contain between 1 and 20 files")
        await asyncio.to_thread(self.root.mkdir, parents=True, exist_ok=True)
        results: list[dict[str, Any]] = []
        batch_hashes: set[str] = set()
        for upload in files:
            name = Path(upload.filename or "").name
            if Path(name).suffix.lower() != ".txt":
                results.append(
                    {
                        "fileName": name or "unnamed",
                        "status": "failed",
                        "reason": "Only .txt files are supported",
                    }
                )
                continue
            data = await upload.read()
            if len(data) > self.settings.python_api_max_upload_size_bytes:
                results.append(
                    {
                        "fileName": name,
                        "status": "failed",
                        "reason": "File exceeds upload size limit",
                    }
                )
                continue
            try:
                data.decode("utf-8")
            except UnicodeDecodeError:
                results.append(
                    {"fileName": name, "status": "failed", "reason": "File must be UTF-8 encoded"}
                )
                continue
            digest = hashlib.sha256(data).hexdigest()
            duplicate = await self.db.scalar(
                select(DigitalAvatarDocument).where(DigitalAvatarDocument.file_hash == digest)
            )
            if digest in batch_hashes or duplicate:
                results.append(
                    {
                        "fileName": name,
                        "status": "duplicate",
                        "duplicateOf": None
                        if not duplicate
                        else {"documentId": str(duplicate.id), "fileName": duplicate.file_name},
                    }
                )
                continue
            batch_hashes.add(digest)
            target = self.root / name
            await asyncio.to_thread(target.write_bytes, data)
            source = await asyncio.to_thread(self._describe, target, self.root)
            results.append(await self._process_source(source, force=False))
        return self._upload_result(results)

    async def import_directory(self, source_root: Path) -> dict[str, Any]:
        """Copies and idempotently indexes every txt below a source directory."""
        source_root = await asyncio.to_thread(source_root.resolve)
        if not await asyncio.to_thread(source_root.is_dir):
            raise ValueError(f"Source directory does not exist: {source_root}")
        await asyncio.to_thread(self.root.mkdir, parents=True, exist_ok=True)
        files = await asyncio.to_thread(self._txt_files, source_root)
        results = []
        for source_path in files:
            relative = source_path.relative_to(source_root)
            target = (self.root / relative).resolve()
            if not self._inside(target, self.root):
                results.append(
                    {
                        "fileName": source_path.name,
                        "status": "failed",
                        "reason": "Invalid source path",
                    }
                )
                continue
            try:
                source = await asyncio.to_thread(
                    self._describe_for_target, source_path, target, self.root
                )
                duplicate = await self._duplicate_result(source, force=False)
                if duplicate:
                    results.append(duplicate)
                    continue
                await asyncio.to_thread(target.parent.mkdir, parents=True, exist_ok=True)
                await asyncio.to_thread(shutil.copy2, source_path, target)
            except Exception as error:
                await self.db.rollback()
                results.append(
                    {
                        "fileName": source_path.name,
                        "sourcePath": relative.as_posix(),
                        "status": "failed",
                        "reason": str(error),
                    }
                )
                continue
            results.append(await self._process_source(source, force=False))
        return self._upload_result(results)

    async def _process_source(self, source: DigitalAvatarSource, force: bool) -> dict[str, Any]:
        """Indexes one source and maps failures to a batch result."""
        try:
            duplicate = await self._duplicate_result(source, force)
            if duplicate:
                return duplicate
            document_id, chunk_count = await self._ingest_source(source, force=force)
            return {
                "fileName": source.file_name,
                "sourcePath": source.source_path,
                "status": "indexed",
                "documentId": str(document_id),
                "chunks": chunk_count,
            }
        except Exception as error:
            await self.db.rollback()
            try:
                await self.repository.mark_failed(source, str(error))
                await self.db.commit()
            except Exception:
                await self.db.rollback()
            return {
                "fileName": source.file_name,
                "sourcePath": source.source_path,
                "status": "failed",
                "reason": str(error),
            }

    async def _duplicate_result(
        self, source: DigitalAvatarSource, force: bool
    ) -> dict[str, Any] | None:
        """Returns an idempotent result without mutating the managed source file."""
        existing = await self.db.scalar(
            select(DigitalAvatarDocument).where(
                DigitalAvatarDocument.source_path == source.source_path
            )
        )
        duplicate = await self.db.scalar(
            select(DigitalAvatarDocument).where(DigitalAvatarDocument.file_hash == source.file_hash)
        )
        if duplicate and (not existing or duplicate.id != existing.id):
            return {
                "fileName": source.file_name,
                "sourcePath": source.source_path,
                "status": "duplicate",
                "duplicateOf": {"documentId": str(duplicate.id), "fileName": duplicate.file_name},
            }
        if (
            existing
            and existing.file_hash == source.file_hash
            and existing.status == "ready"
            and not force
        ):
            return {
                "fileName": source.file_name,
                "sourcePath": source.source_path,
                "status": "duplicate",
                "documentId": str(existing.id),
                "duplicateOf": {"documentId": str(existing.id), "fileName": existing.file_name},
            }
        return None

    async def _ingest_source(self, source: DigitalAvatarSource, force: bool) -> tuple[int, int]:
        """Parses, embeds, and commits one managed source file."""
        del force
        text = await asyncio.to_thread(source.absolute_path.read_text, encoding="utf-8")
        parsed = parse_digital_avatar_text(text)
        if not parsed.chunks:
            raise ValueError("Document has no extractable text")
        chunks = [
            {
                "content": item.content,
                "metadata": {
                    "sourcePath": source.source_path,
                    "fileName": source.file_name,
                    "fileType": "txt",
                    "heading": item.heading,
                    "isSummary": item.is_summary,
                },
            }
            for item in parsed.chunks
        ]
        vectors = await self._embed([str(item["content"]) for item in chunks])
        try:
            document_id = await self.repository.replace_document(
                source, parsed.summary, chunks, vectors
            )
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise ValueError("Document content already exists") from None
        return document_id, len(chunks)

    async def _embed(self, texts: list[str]) -> list[list[float]]:
        """Embeds fixed chunks in provider-compatible bounded batches."""
        vectors: list[list[float]] = []
        size = min(max(self.settings.rag_embedding_batch_size, 1), 10)
        for index in range(0, len(texts), size):
            vectors.extend(await self.embeddings.aembed_documents(texts[index : index + size]))
        return vectors

    async def _document(self, document_id: int) -> DigitalAvatarDocument:
        """Loads one global digital avatar document or reports a stable error."""
        document = await self.db.get(DigitalAvatarDocument, document_id)
        if not document:
            raise HTTPException(400, f"Digital avatar document #{document_id} not found")
        return document

    async def _serialize_with_count(self, document: DigitalAvatarDocument) -> dict[str, Any]:
        """Serializes a document and measures its actual chunk count."""
        count = await self.db.scalar(
            select(func.count())
            .select_from(DigitalAvatarChunk)
            .where(DigitalAvatarChunk.document_id == document.id)
        )
        return json_value(
            {
                "id": str(document.id),
                "sourcePath": document.source_path,
                "fileName": document.file_name,
                "fileType": document.file_type,
                "fileHash": document.file_hash,
                "fileSize": str(document.file_size),
                "summary": document.summary,
                "chunkCount": document.chunk_count,
                "actualChunkCount": count or 0,
                "status": document.status,
                "error": document.error,
                "createdAt": document.created_at,
                "updatedAt": document.updated_at,
                "ingestedAt": document.ingested_at,
            }
        )

    @staticmethod
    def _describe(path: Path, root: Path) -> DigitalAvatarSource:
        """Builds stable metadata for one UTF-8 txt below the managed root."""
        resolved = path.resolve()
        if resolved.suffix.lower() != ".txt":
            raise ValueError("Only .txt files are supported")
        data = resolved.read_bytes()
        data.decode("utf-8")
        return DigitalAvatarSource(
            absolute_path=resolved,
            source_path=resolved.relative_to(root.resolve()).as_posix(),
            file_name=resolved.name,
            file_hash=hashlib.sha256(data).hexdigest(),
            file_size=len(data),
        )

    @staticmethod
    def _describe_for_target(path: Path, target: Path, root: Path) -> DigitalAvatarSource:
        """Builds managed metadata from an import source before copying it."""
        data = path.read_bytes()
        data.decode("utf-8")
        return DigitalAvatarSource(
            absolute_path=target,
            source_path=target.relative_to(root.resolve()).as_posix(),
            file_name=target.name,
            file_hash=hashlib.sha256(data).hexdigest(),
            file_size=len(data),
        )

    @staticmethod
    def _txt_files(root: Path) -> list[Path]:
        """Collects txt files for a directory import outside the event loop."""
        return sorted(path for path in root.rglob("*.txt") if path.is_file())

    @staticmethod
    def _inside(path: Path, parent: Path) -> bool:
        """Checks whether a resolved path remains below the managed root."""
        try:
            path.relative_to(parent)
            return True
        except ValueError:
            return False

    @staticmethod
    def _upload_result(results: list[dict[str, Any]]) -> dict[str, Any]:
        """Summarizes indexed, duplicate, and failed file results."""
        return {
            "totalFiles": len(results),
            "indexedFiles": sum(item["status"] == "indexed" for item in results),
            "duplicateFiles": sum(item["status"] == "duplicate" for item in results),
            "failedFiles": sum(item["status"] == "failed" for item in results),
            "chunks": sum(item.get("chunks", 0) for item in results),
            "files": results,
        }
