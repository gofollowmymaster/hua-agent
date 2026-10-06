from __future__ import annotations

import asyncio
import hashlib
import json
import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.config import get_settings
from python_api.core.context import get_request_context
from python_api.embeddings import create_embeddings
from python_api.models import AgentChunk, AgentDocument
from python_api.schemas.agent_knowledge import AgentDocumentPageRequest, AgentKnowledgeSearchRequest
from python_api.schemas.common import PageRequest, json_value

TENANT_PREFIX = {"aplus": "Aplus", "boat": "Boat", "yurex": "Yurex"}


class AgentKnowledgeService:
    """Manages business Agent documents, ingestion and hybrid retrieval."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.tenant = get_request_context().tenant_code
        settings = get_settings()
        self.embeddings = create_embeddings(settings)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.agent_chunk_size,
            chunk_overlap=settings.agent_chunk_overlap,
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
        paths = (
            [item for item in tenant_root.rglob("*.md") if item.is_file()]
            if tenant_root.exists()
            else []
        )
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
            raw = path.read_text(encoding="utf-8-sig")
            metadata, content = self._frontmatter(raw)
            content = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", content)
            content = re.sub(r"\n{3,}", "\n\n", content).strip()
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            existing = await self.db.scalar(
                select(AgentDocument).where(
                    AgentDocument.tenant_code == self.tenant, AgentDocument.source_path == source
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
                    for value in self.splitter.split_text(content)
                    if value.strip()
                ]
                if not chunks:
                    raise ValueError("no extractable content")
                vectors = await self.embeddings.aembed_documents(
                    [str(item["content"]) for item in chunks]
                )
                document_id = await self._replace_document(
                    path, source, digest, category, metadata, chunks, vectors
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
                summary["failedFiles"] += 1
                summary["files"].append(
                    {"sourcePath": source, "status": "failed", "reason": str(error)}
                )
        return summary

    async def _fulltext(self, query: str, category: str | None, limit: int) -> list[dict[str, Any]]:
        """Retrieves tenant-scoped Agent chunks ranked by zhparser relevance."""
        sql = text("""WITH keyword_terms AS (SELECT DISTINCT term.lexeme FROM ts_debug('zhparser', :query) debug CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme) WHERE term.lexeme <> ''), keyword_query AS (SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query FROM keyword_terms)
            SELECT c.id,c.tenant_code,c.document_id,c.chunk_index,c.content,c.metadata,d.category,d.file_name,d.source_path,d.remote_url,d.doc_id,d.wiki_node_id,d.last_modified_at,d.breadcrumb,d.source_type,d.current_version,ts_rank_cd(to_tsvector('zhparser', c.content), keyword_query.query) AS score
            FROM agent_chunks c JOIN agent_documents d ON d.id=c.document_id CROSS JOIN keyword_query WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) AND keyword_query.query IS NOT NULL AND to_tsvector('zhparser', c.content) @@ keyword_query.query ORDER BY score DESC,c.id ASC LIMIT :limit""")
        rows = (
            (
                await self.db.execute(
                    sql,
                    {"query": query, "tenant": self.tenant, "category": category, "limit": limit},
                )
            )
            .mappings()
            .all()
        )
        return [self._hit(row) for row in rows]

    async def _vector(self, query: str, category: str | None, limit: int) -> list[dict[str, Any]]:
        """Retrieves tenant-scoped Agent chunks nearest to the query embedding."""
        vector = json.dumps(await self.embeddings.aembed_query(query))
        sql = text(
            """SELECT c.id,c.tenant_code,c.document_id,c.chunk_index,c.content,c.metadata,d.category,d.file_name,d.source_path,d.remote_url,d.doc_id,d.wiki_node_id,d.last_modified_at,d.breadcrumb,d.source_type,d.current_version,1-(c.embedding <=> CAST(:vector AS vector)) AS score FROM agent_chunks c JOIN agent_documents d ON d.id=c.document_id WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) ORDER BY c.embedding <=> CAST(:vector AS vector) LIMIT :limit"""
        )
        rows = (
            (
                await self.db.execute(
                    sql,
                    {"vector": vector, "tenant": self.tenant, "category": category, "limit": limit},
                )
            )
            .mappings()
            .all()
        )
        return [self._hit(row) for row in rows]

    async def _page_by_keyword(self, request: AgentDocumentPageRequest) -> dict[str, Any]:
        """Pages documents matching metadata or zhparser-indexed chunk content."""
        keyword = (request.keyword or "").strip()
        sql = text(
            """WITH keyword_terms AS (SELECT DISTINCT term.lexeme FROM ts_debug('zhparser', :keyword) debug CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme) WHERE term.lexeme<>''), keyword_query AS (SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query FROM keyword_terms), matches AS (SELECT d.id,d.updated_at FROM agent_documents d CROSS JOIN keyword_query WHERE d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) AND (CAST(:status AS text) IS NULL OR d.status=:status) AND (strpos(d.file_name,:keyword)>0 OR strpos(d.source_path,:keyword)>0 OR strpos(COALESCE(d.breadcrumb,''),:keyword)>0 OR (keyword_query.query IS NOT NULL AND EXISTS (SELECT 1 FROM agent_chunks c WHERE c.tenant_code=:tenant AND c.document_id=d.id AND to_tsvector('zhparser',c.content) @@ keyword_query.query)))) SELECT id, count(*) OVER() AS total FROM matches ORDER BY updated_at DESC,id DESC LIMIT :limit OFFSET :offset"""
        )
        rows = (
            (
                await self.db.execute(
                    sql,
                    {
                        "keyword": keyword,
                        "tenant": self.tenant,
                        "category": request.category,
                        "status": request.status,
                        "limit": request.page_size,
                        "offset": (request.page - 1) * request.page_size,
                    },
                )
            )
            .mappings()
            .all()
        )
        ids = [row["id"] for row in rows]
        documents = (
            (await self.db.scalars(select(AgentDocument).where(AgentDocument.id.in_(ids)))).all()
            if ids
            else []
        )
        by_id = {item.id: item for item in documents}
        return {
            "list": [await self._serialize_document(by_id[item]) for item in ids],
            "total": int(rows[0]["total"]) if rows else 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def _replace_document(
        self,
        path: Path,
        source: str,
        digest: str,
        category: str,
        metadata: dict[str, str],
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Atomically replaces one Agent document, its chunks, and vector data."""

        def value(key: str) -> str:
            """Reads a trimmed optional frontmatter value."""
            return metadata.get(key, "").strip()

        file_size = (await asyncio.to_thread(path.stat)).st_size
        result = await self.db.execute(
            text(
                """INSERT INTO agent_documents (tenant_code,category,source_path,file_name,file_type,file_hash,file_size,status,metadata,remote_url,doc_id,wiki_node_id,last_modified_at,breadcrumb,source_type,current_version,updated_at) VALUES (:tenant,:category,:source,:name,'md',:hash,:size,'processing',CAST(:metadata AS jsonb),:remote,:doc_id,:wiki,:modified,:breadcrumb,:source_type,:version,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,source_path) DO UPDATE SET category=EXCLUDED.category,file_name=EXCLUDED.file_name,file_hash=EXCLUDED.file_hash,file_size=EXCLUDED.file_size,status='processing',error=NULL,metadata=EXCLUDED.metadata,remote_url=EXCLUDED.remote_url,doc_id=EXCLUDED.doc_id,wiki_node_id=EXCLUDED.wiki_node_id,last_modified_at=EXCLUDED.last_modified_at,breadcrumb=EXCLUDED.breadcrumb,source_type=EXCLUDED.source_type,current_version=EXCLUDED.current_version,updated_at=CURRENT_TIMESTAMP RETURNING id"""
            ),
            {
                "tenant": self.tenant,
                "category": category,
                "source": source,
                "name": path.name,
                "hash": digest,
                "size": file_size,
                "metadata": json.dumps(metadata, ensure_ascii=False),
                "remote": value("远程文档"),
                "doc_id": value("文档ID"),
                "wiki": value("Wiki节点ID"),
                "modified": value("最后修改时间"),
                "breadcrumb": value("文档路径面包屑"),
                "source_type": value("source_type"),
                "version": value("当前版本"),
            },
        )
        document_id = int(result.scalar_one())
        await self.db.execute(
            text("DELETE FROM agent_chunks WHERE tenant_code=:tenant AND document_id=:id"),
            {"tenant": self.tenant, "id": document_id},
        )
        for index, chunk in enumerate(chunks):
            await self.db.execute(
                text(
                    "INSERT INTO agent_chunks (tenant_code,document_id,chunk_index,content,metadata,embedding) VALUES (:tenant,:id,:idx,:content,CAST(:metadata AS jsonb),CAST(:embedding AS vector))"
                ),
                {
                    "tenant": self.tenant,
                    "id": document_id,
                    "idx": index,
                    "content": chunk["content"],
                    "metadata": json.dumps(chunk["metadata"], ensure_ascii=False),
                    "embedding": json.dumps(vectors[index]),
                },
            )
        await self.db.execute(
            text(
                "UPDATE agent_documents SET chunk_count=:count,status='ready',error=NULL,updated_at=CURRENT_TIMESTAMP,ingested_at=CURRENT_TIMESTAMP WHERE id=:id AND tenant_code=:tenant"
            ),
            {"count": len(chunks), "id": document_id, "tenant": self.tenant},
        )
        await self.db.commit()
        return document_id

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
        configured = Path(get_settings().agent_docs_dir)
        if configured.is_absolute():
            return configured.resolve()
        return (get_settings().workspace_root / "apps" / "api" / configured).resolve()

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
