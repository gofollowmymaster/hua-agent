from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import undefer

from python_api.core.concurrency import run_file_work
from python_api.core.config import Settings, get_settings
from python_api.core.context import get_request_context
from python_api.core.schemas import PageRequest, json_value
from python_api.integrations.embeddings import create_embeddings
from python_api.modules.agent.knowledge.schemas import (
    AgentDocumentPageRequest,
    AgentKnowledgeSearchRequest,
)
from python_api.modules.agent.models import AgentChunk, AgentDocument
from python_api.modules.agent.repository import AgentRepository

TENANT_PREFIX = {"aplus": "Aplus", "boat": "Boat", "yurex": "Yurex"}


def _markdown_paths(root: Path) -> list[Path]:
    """Collects Markdown files without blocking the event loop."""
    return [item for item in root.rglob("*.md") if item.is_file()] if root.exists() else []


def _read_markdown(path: Path) -> tuple[str, str]:
    """Reads and hashes one Markdown file in a single worker-thread operation."""
    content = path.read_bytes()
    return content.decode("utf-8-sig"), hashlib.sha256(content).hexdigest()


class AgentKnowledgeService:
    """Manages business Agent documents, ingestion and hybrid retrieval."""

    def __init__(
        self,
        db: AsyncSession,
        settings: Settings | None = None,
        embeddings: Any | None = None,
    ) -> None:
        self.db = db
        self.repository = AgentRepository(db)
        self.tenant = get_request_context().tenant_code
        self.settings = settings or get_settings()
        self.embeddings = embeddings or create_embeddings(self.settings)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.agent_chunk_size,
            chunk_overlap=self.settings.agent_chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""],
        )

    async def page_documents(self, request: AgentDocumentPageRequest) -> dict[str, Any]:
        """Pages tenant documents, using zhparser when a keyword is supplied."""
        if request.keyword and request.keyword.strip():
            return await self._page_by_keyword(request)
        filters: list[Any] = [AgentDocument.tenant_code == self.tenant]
        if request.category:
            filters.append(AgentDocument.category == request.category)
        if request.status:
            filters.append(AgentDocument.status == request.status)
        total = await self.db.scalar(
            select(func.count()).select_from(AgentDocument).where(*filters)
        )
        documents = (
            await self.db.scalars(
                select(AgentDocument)
                .where(*filters)
                .order_by(AgentDocument.updated_at.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        return {
            "list": [await self._serialize_document(item) for item in documents],
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def get_document(self, document_id: int) -> dict[str, Any]:
        """Returns one tenant-owned Agent document."""
        return await self._serialize_document(await self._owned_document(document_id))

    async def get_document_for_tool(self, document_id: int) -> dict[str, Any]:
        """Returns one tenant-owned Agent document with its complete original text."""
        document = await self.db.scalar(
            select(AgentDocument)
            .options(undefer(AgentDocument.content))
            .where(
                AgentDocument.id == document_id,
                AgentDocument.tenant_code == self.tenant,
            )
        )
        if not document:
            raise HTTPException(400, f"Agent document #{document_id} not found")
        return {**(await self._serialize_document(document)), "content": document.content}

    async def page_chunks(self, document_id: int, request: PageRequest) -> dict[str, Any]:
        """Pages ordered chunks for one Agent document."""
        await self._owned_document(document_id)
        filters = [AgentChunk.tenant_code == self.tenant, AgentChunk.document_id == document_id]
        total = await self.db.scalar(select(func.count()).select_from(AgentChunk).where(*filters))
        chunks = (
            await self.db.scalars(
                select(AgentChunk)
                .where(*filters)
                .order_by(AgentChunk.chunk_index)
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

    async def preview_file(self, document_id: int) -> tuple[Path, AgentDocument]:
        """Resolves a Markdown preview below the configured docs root."""
        document = await self._owned_document(document_id)
        root = self._docs_root()
        path = (root / document.source_path).resolve()
        try:
            path.relative_to(root)
        except ValueError as error:
            raise HTTPException(400, f"Agent document #{document_id} not found") from error
        if not path.is_file():
            raise HTTPException(400, "Preview file not found")
        return path, document

    async def delete_document(self, document_id: int) -> dict[str, Any]:
        """Deletes a tenant-owned Agent document and cascading chunks."""
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

    async def search(self, request: AgentKnowledgeSearchRequest) -> list[dict[str, Any]]:
        """Runs full-text, vector, or RRF-fused retrieval."""
        query = request.query.strip()
        if request.mode == "fulltext":
            return await self._fulltext(query, request.category, request.top_k)
        if request.mode == "vector":
            return await self._vector(query, request.category, request.top_k)
        limit = min(request.top_k * 2, 100)
        fulltext_hits = await self._fulltext(query, request.category, limit)
        vector_hits = await self._vector(query, request.category, limit)
        merged: dict[str, dict[str, Any]] = {}
        for candidates in (fulltext_hits, vector_hits):
            for rank, hit in enumerate(candidates):
                current = merged.setdefault(hit["id"], {"hit": hit, "score": 0.0})
                current["score"] += 1 / (61 + rank)
        ranked = sorted(merged.values(), key=lambda item: item["score"], reverse=True)[
            : request.top_k
        ]
        return [{**item["hit"], "score": item["score"]} for item in ranked]

    async def ingest(self, force: bool) -> dict[str, Any]:
        """Indexes current-tenant Markdown documents and frontmatter metadata."""
        root = self._docs_root()
        tenant_root = root / self.tenant
        paths = await run_file_work(_markdown_paths, tenant_root)
        summary: dict[str, Any] = {
            "scannedFiles": len(paths),
            "indexedFiles": 0,
            "skippedFiles": 0,
            "failedFiles": 0,
            "chunks": 0,
            "files": [],
        }
        for path in paths:
            source = path.relative_to(root).as_posix()
            raw, digest = await run_file_work(_read_markdown, path)
            metadata, body = self._frontmatter(raw)
            cleaned_content = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", body)
            cleaned_content = re.sub(r"\n{3,}", "\n\n", cleaned_content).strip()
            existing = await self.db.scalar(
                select(AgentDocument)
                .options(undefer(AgentDocument.content))
                .where(
                    AgentDocument.tenant_code == self.tenant,
                    AgentDocument.source_path == source,
                )
            )
            duplicate = await self.db.scalar(
                select(AgentDocument).where(
                    AgentDocument.tenant_code == self.tenant, AgentDocument.file_hash == digest
                )
            )
            parts = Path(source).parts
            category = parts[1] if len(parts) > 1 else ""
            prefix = TENANT_PREFIX.get(self.tenant, "")
            category = (
                re.sub(f"^{re.escape(prefix)}\\s*", "", category, flags=re.I).strip()
                if prefix
                else category
            )
            if duplicate and (not existing or duplicate.id != existing.id):
                summary["skippedFiles"] += 1
                summary["files"].append(
                    {"sourcePath": source, "status": "skipped", "reason": "duplicate hash"}
                )
                continue
            if (
                existing
                and existing.file_hash == digest
                and existing.status == "ready"
                and existing.category == category
                and existing.content == raw
                and not force
            ):
                summary["skippedFiles"] += 1
                summary["files"].append(
                    {"sourcePath": source, "status": "skipped", "reason": "hash unchanged"}
                )
                continue
            try:
                chunks = [
                    {
                        "content": value.strip(),
                        "metadata": {
                            **metadata,
                            "tenantCode": self.tenant,
                            "category": category,
                            "sourcePath": source,
                            "fileName": path.name,
                            "fileType": "md",
                        },
                    }
                    for value in self.splitter.split_text(cleaned_content)
                    if value.strip()
                ]
                if not chunks:
                    raise ValueError("no extractable content")
                vectors = await self.embeddings.aembed_documents(
                    [str(item["content"]) for item in chunks]
                )
                document_id = await self._replace_document(
                    path, source, digest, category, raw, metadata, chunks, vectors
                )
                summary["indexedFiles"] += 1
                summary["chunks"] += len(chunks)
                summary["files"].append(
                    {
                        "sourcePath": source,
                        "status": "indexed",
                        "documentId": str(document_id),
                        "chunks": len(chunks),
                    }
                )
            except Exception as error:
                await self.db.rollback()
                await self._mark_document_failed(
                    path, source, digest, category, raw, metadata, str(error)
                )
                summary["failedFiles"] += 1
                summary["files"].append(
                    {"sourcePath": source, "status": "failed", "reason": str(error)}
                )
        return summary

    async def _fulltext(self, query: str, category: str | None, limit: int) -> list[dict[str, Any]]:
        """Retrieves tenant-scoped Agent chunks ranked by zhparser relevance."""
        rows = await self.repository.search_fulltext_chunks(
            query, self.tenant, category, limit
        )
        return [self._hit(row) for row in rows]

    async def _vector(self, query: str, category: str | None, limit: int) -> list[dict[str, Any]]:
        """Retrieves tenant-scoped Agent chunks nearest to the query embedding."""
        rows = await self.repository.search_vector_chunks(
            await self.embeddings.aembed_query(query), self.tenant, category, limit
        )
        return [self._hit(row) for row in rows]

    async def _page_by_keyword(self, request: AgentDocumentPageRequest) -> dict[str, Any]:
        """Pages documents matching metadata or zhparser-indexed chunk content."""
        keyword = (request.keyword or "").strip()
        ids, total = await self.repository.page_document_ids_by_keyword(
            keyword,
            self.tenant,
            request.category,
            request.status,
            request.page_size,
            (request.page - 1) * request.page_size,
        )
        documents = (
            (await self.db.scalars(select(AgentDocument).where(AgentDocument.id.in_(ids)))).all()
            if ids
            else []
        )
        by_id = {item.id: item for item in documents}
        return {
            "list": [await self._serialize_document(by_id[item]) for item in ids],
            "total": total,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def _replace_document(
        self,
        path: Path,
        source: str,
        digest: str,
        category: str,
        content: str,
        metadata: dict[str, str],
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Atomically replaces one Agent document, its chunks, and vector data."""

        file_size = (await run_file_work(path.stat)).st_size
        document_id = await self.repository.replace_document(
            tenant=self.tenant,
            category=category,
            source=source,
            file_name=path.name,
            file_hash=digest,
            file_size=file_size,
            content=content,
            metadata=metadata,
            chunks=chunks,
            vectors=vectors,
        )
        await self.db.commit()
        return document_id

    async def _mark_document_failed(
        self,
        path: Path,
        source: str,
        digest: str,
        category: str,
        content: str,
        metadata: dict[str, str],
        error: str,
    ) -> None:
        """Persists a failed document and its original text after rolling back its work."""
        file_size = (await run_file_work(path.stat)).st_size
        await self.repository.mark_document_failed(
            tenant=self.tenant,
            category=category,
            source=source,
            file_name=path.name,
            file_hash=digest,
            file_size=file_size,
            content=content,
            metadata=metadata,
            error=error,
        )
        await self.db.commit()

    async def _owned_document(self, document_id: int) -> AgentDocument:
        """Loads one Agent document only when it belongs to the current tenant."""
        document = await self.db.scalar(
            select(AgentDocument).where(
                AgentDocument.id == document_id, AgentDocument.tenant_code == self.tenant
            )
        )
        if not document:
            raise HTTPException(400, f"Agent document #{document_id} not found")
        return document

    async def _serialize_document(self, document: AgentDocument) -> dict[str, Any]:
        """Serializes an Agent document with its actual persisted chunk count."""
        count = await self.db.scalar(
            select(func.count())
            .select_from(AgentChunk)
            .where(AgentChunk.document_id == document.id)
        )
        return json_value(
            {
                "id": str(document.id),
                "tenantCode": document.tenant_code,
                "category": document.category,
                "sourcePath": document.source_path,
                "fileName": document.file_name,
                "fileType": document.file_type,
                "fileHash": document.file_hash,
                "fileSize": str(document.file_size),
                "chunkCount": document.chunk_count,
                "actualChunkCount": count or 0,
                "status": document.status,
                "error": document.error,
                "metadata": document.metadata_,
                "remoteUrl": document.remote_url,
                "docId": document.doc_id,
                "wikiNodeId": document.wiki_node_id,
                "lastModifiedAt": document.last_modified_at,
                "breadcrumb": document.breadcrumb,
                "sourceType": document.source_type,
                "currentVersion": document.current_version,
                "createdAt": document.created_at,
                "updatedAt": document.updated_at,
                "ingestedAt": document.ingested_at,
            }
        )

    @staticmethod
    def _frontmatter(raw: str) -> tuple[dict[str, str], str]:
        """Separates simple YAML-like frontmatter from Markdown body text."""
        lines = raw.removeprefix("\ufeff").splitlines()
        if not lines or lines[0].strip() != "---":
            return {}, raw.strip()
        try:
            end = next(index for index, line in enumerate(lines[1:], 1) if line.strip() == "---")
        except StopIteration:
            return {}, raw.strip()
        metadata = {}
        for line in lines[1:end]:
            if ":" in line:
                key, value = line.split(":", 1)
                metadata[key.strip()] = value.strip().strip('"').replace('\\"', '"')
        return metadata, "\n".join(lines[end + 1 :]).strip()

    def _docs_root(self) -> Path:
        """Resolves the configured Agent document root against the workspace."""
        configured = Path(self.settings.agent_docs_dir)
        if configured.is_absolute():
            return configured.resolve()
        return (self.settings.workspace_root / "apps" / "api" / configured).resolve()

    @staticmethod
    def _hit(row: Any) -> dict[str, Any]:
        """Maps a retrieval row to the stable Agent knowledge hit contract."""
        return {
            "id": str(row["id"]),
            "documentId": str(row["document_id"]),
            "tenantCode": row["tenant_code"],
            "category": row["category"],
            "chunkIndex": int(row["chunk_index"]),
            "content": row["content"],
            "metadata": row["metadata"] or {},
            "score": float(row["score"] or 0),
            "fileName": row["file_name"],
            "sourcePath": row["source_path"],
            "remoteUrl": row["remote_url"],
            "docId": row["doc_id"],
            "wikiNodeId": row["wiki_node_id"],
            "lastModifiedAt": row["last_modified_at"],
            "breadcrumb": row["breadcrumb"],
            "sourceType": row["source_type"],
            "currentVersion": row["current_version"],
        }
