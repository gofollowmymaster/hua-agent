from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.concurrency import run_file_work
from python_api.core.config import Settings, get_settings
from python_api.core.context import get_request_context
from python_api.integrations.embeddings import create_embeddings
from python_api.modules.rag.admin.parser import (
    SUPPORTED_EXTENSIONS,
    DocumentLoader,
    RawDocument,
)
from python_api.modules.rag.models import AplusDocument
from python_api.modules.rag.repository import RagRepository


class DocumentIngestService:
    """Indexes RAG documents into the Prisma-owned pgvector schema."""

    def __init__(
        self,
        db: AsyncSession,
        settings: Settings | None = None,
        embeddings: Any | None = None,
        loader: DocumentLoader | None = None,
    ) -> None:
        self.db = db
        self.repository = RagRepository(db)
        self.settings = settings or get_settings()
        self.loader = loader or DocumentLoader(self.settings)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.rag_chunk_size,
            chunk_overlap=self.settings.rag_chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""],
        )
        self.embeddings = embeddings or create_embeddings(self.settings)

    async def ingest_rag(self, force: bool = False) -> dict[str, Any]:
        """Scans and indexes the current tenant raw directory."""
        tenant = get_request_context().tenant_code
        files = await run_file_work(self.loader.scan, tenant)
        return await self._ingest_files(files, tenant, force)

    async def upload(self, files: list[UploadFile]) -> dict[str, Any]:
        """Validates, stores, deduplicates and indexes a multipart batch."""
        if not files:
            raise HTTPException(400, "files are required")
        if len(files) > self.settings.python_api_max_upload_files:
            raise HTTPException(400, "Too many files")
        tenant = get_request_context().tenant_code
        root = self.loader.raw_root(tenant)
        await run_file_work(root.mkdir, parents=True, exist_ok=True)
        hashes: dict[str, str] = {}
        results: list[dict[str, Any]] = []
        for upload in files:
            file_name = Path(upload.filename or "").name.strip()
            if not file_name:
                results.append(
                    {
                        "fileName": upload.filename or "-",
                        "status": "failed",
                        "reason": "invalid file name",
                    }
                )
                continue
            if Path(file_name).suffix.lower() not in SUPPORTED_EXTENSIONS:
                results.append(
                    {
                        "fileName": file_name,
                        "status": "failed",
                        "reason": f"unsupported file type; supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
                    }
                )
                continue
            data = await upload.read(self.settings.python_api_max_upload_size_bytes + 1)
            if len(data) > self.settings.python_api_max_upload_size_bytes:
                raise HTTPException(400, "File too large")
            digest = (await run_file_work(hashlib.sha256, data)).hexdigest()
            if digest in hashes:
                results.append(
                    {
                        "fileName": file_name,
                        "status": "duplicate",
                        "reason": f"duplicate of {hashes[digest]} in current batch",
                    }
                )
                continue
            hashes[digest] = file_name
            existing = await self.db.scalar(
                select(AplusDocument).where(
                    AplusDocument.tenant_code == tenant, AplusDocument.file_hash == digest
                )
            )
            if existing:
                results.append(
                    {
                        "fileName": file_name,
                        "status": "duplicate",
                        "reason": "duplicate hash",
                        "duplicateOf": {
                            "documentId": str(existing.id),
                            "fileName": existing.file_name,
                        },
                    }
                )
                continue
            target = self._unique_target(root, file_name)
            await run_file_work(target.write_bytes, data)
            try:
                raw = await run_file_work(self.loader.describe, target, root, tenant, file_name)
                summary = await self._ingest_files([raw], tenant, False)
                item = summary["files"][0]
                if item.get("status") == "indexed":
                    results.append(
                        {
                            "fileName": file_name,
                            "status": "indexed",
                            "documentId": item["documentId"],
                            "sourcePath": raw.source_path,
                            "chunks": item["chunks"],
                        }
                    )
                else:
                    results.append(
                        {
                            "fileName": file_name,
                            "status": "failed",
                            "sourcePath": raw.source_path,
                            "reason": item.get("reason", "document indexing failed"),
                        }
                    )
            except Exception as error:
                results.append(
                    {
                        "fileName": file_name,
                        "status": "failed",
                        "sourcePath": target.name,
                        "reason": str(error),
                    }
                )
        return {
            "totalFiles": len(files),
            "indexedFiles": sum(item["status"] == "indexed" for item in results),
            "duplicateFiles": sum(item["status"] == "duplicate" for item in results),
            "failedFiles": sum(item["status"] == "failed" for item in results),
            "chunks": sum(item.get("chunks", 0) for item in results),
            "files": results,
        }

    async def _ingest_files(
        self, files: list[RawDocument], tenant: str, force: bool
    ) -> dict[str, Any]:
        """Ingests files independently and reports indexed, skipped, and failed totals."""
        summary: dict[str, Any] = {
            "scannedFiles": len(files),
            "indexedFiles": 0,
            "skippedFiles": 0,
            "failedFiles": 0,
            "chunks": 0,
            "files": [],
        }
        for file in files:
            existing = await self.db.scalar(
                select(AplusDocument).where(
                    AplusDocument.tenant_code == tenant,
                    AplusDocument.source_path == file.source_path,
                )
            )
            duplicate = await self.db.scalar(
                select(AplusDocument).where(
                    AplusDocument.tenant_code == tenant, AplusDocument.file_hash == file.file_hash
                )
            )
            if duplicate and (not existing or duplicate.id != existing.id):
                summary["skippedFiles"] += 1
                summary["files"].append(
                    {
                        "sourcePath": file.source_path,
                        "status": "skipped",
                        "reason": "duplicate hash",
                        "duplicateOf": {
                            "documentId": str(duplicate.id),
                            "fileName": duplicate.file_name,
                        },
                    }
                )
                continue
            if (
                existing
                and existing.file_hash == file.file_hash
                and existing.status == "ready"
                and not force
            ):
                summary["skippedFiles"] += 1
                summary["files"].append(
                    {
                        "sourcePath": file.source_path,
                        "status": "skipped",
                        "reason": "hash unchanged",
                    }
                )
                continue
            try:
                chunks = await run_file_work(self._build_chunks, file, tenant)
                if not chunks:
                    raise ValueError("no extractable text")
                vectors = await self._embed([item["content"] for item in chunks])
                document_id = await self._replace(file, tenant, chunks, vectors)
                summary["indexedFiles"] += 1
                summary["chunks"] += len(chunks)
                summary["files"].append(
                    {
                        "sourcePath": file.source_path,
                        "status": "indexed",
                        "documentId": str(document_id),
                        "chunks": len(chunks),
                    }
                )
            except Exception as error:
                await self.db.rollback()
                summary["failedFiles"] += 1
                summary["files"].append(
                    {"sourcePath": file.source_path, "status": "failed", "reason": str(error)}
                )
        return summary

    def _build_chunks(self, file: RawDocument, tenant: str) -> list[dict[str, Any]]:
        """Loads and splits a raw document while attaching searchable metadata."""
        chunks = []
        for segment in self.loader.load(file):
            for split in self.splitter.split_text(segment["text"]):
                content = split.strip()
                if content:
                    chunks.append(
                        {
                            "content": content,
                            "metadata": {
                                **segment["metadata"],
                                "sourcePath": file.source_path,
                                "fileName": file.file_name,
                                "fileType": file.file_type,
                                "type": file.document_type,
                                "tenantCode": tenant,
                            },
                        }
                    )
        return chunks

    async def _embed(self, texts: list[str]) -> list[list[float]]:
        """Embeds document text in bounded batches accepted by the provider."""
        result: list[list[float]] = []
        size = min(max(self.settings.rag_embedding_batch_size, 1), 10)
        for index in range(0, len(texts), size):
            result.extend(await self.embeddings.aembed_documents(texts[index : index + size]))
        return result

    async def _replace(
        self,
        file: RawDocument,
        tenant: str,
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Replaces a tenant document and all chunks in one committed transaction."""
        document_id = await self.repository.replace_document(file, tenant, chunks, vectors)
        await self.db.commit()
        return document_id

    @staticmethod
    def _unique_target(root: Path, file_name: str) -> Path:
        """Finds a collision-free upload path without overwriting existing files."""
        stem, suffix = Path(file_name).stem, Path(file_name).suffix
        for index in range(10_000):
            target = root / (file_name if index == 0 else f"{stem} ({index}){suffix}")
            if not target.exists():
                return target
        raise HTTPException(400, "too many files with the same name")
