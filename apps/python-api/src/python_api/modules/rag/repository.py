from __future__ import annotations

import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession


class RagRepository:
    """Owns low-level SQL required by RAG persistence."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def upsert_session(self, session: ResolvedSession) -> int:
        """Creates or refreshes a RAG session and returns its identifier."""
        result = await self.db.execute(
            text(
                """INSERT INTO aplus_rag_sessions (tenant_code,channel,session_key,user_id,conversation_id,conversation_type,metadata,last_active_at,updated_at) VALUES (:tenant,:channel,:key,:user_id,:conversation_id,:conversation_type,CAST(:metadata AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,channel,session_key) DO UPDATE SET user_id=EXCLUDED.user_id,conversation_id=EXCLUDED.conversation_id,conversation_type=EXCLUDED.conversation_type,metadata=EXCLUDED.metadata,last_active_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP RETURNING id"""
            ),
            {
                "tenant": session.tenant_code,
                "channel": session.channel,
                "key": session.session_key,
                "user_id": session.participant_id,
                "conversation_id": session.conversation_id,
                "conversation_type": session.conversation_type,
                "metadata": json.dumps(session.metadata),
            },
        )
        return int(result.scalar_one())

    async def search_keyword_chunks(
        self, query: str, tenant: str, limit: int
    ) -> list[dict[str, Any]]:
        """Returns tenant-scoped RAG chunks ranked by zhparser relevance."""
        result = await self.db.execute(
            text(
                """WITH terms AS (SELECT DISTINCT term.lexeme FROM ts_debug('zhparser', :query) debug CROSS JOIN LATERAL unnest(debug.lexemes) term(lexeme) WHERE term.lexeme<>''), q AS (SELECT string_agg(quote_literal(lexeme),' | ')::tsquery query FROM terms) SELECT c.id,c.document_id,c.chunk_index,c.content,c.metadata,d.file_name,d.file_type,d.source_path,ts_rank_cd(to_tsvector('zhparser',c.content),q.query) score FROM aplus_chunks c JOIN aplus_documents d ON d.id=c.document_id CROSS JOIN q WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant AND q.query IS NOT NULL AND to_tsvector('zhparser',c.content) @@ q.query ORDER BY score DESC,c.id LIMIT :limit"""
            ),
            {"query": query, "tenant": tenant, "limit": limit},
        )
        return [dict(row) for row in result.mappings().all()]

    async def search_vector_chunks(
        self, vector: list[float], tenant: str, limit: int
    ) -> list[dict[str, Any]]:
        """Returns tenant-scoped RAG chunks nearest to an embedding."""
        result = await self.db.execute(
            text(
                """SELECT c.id,c.document_id,c.chunk_index,c.content,c.metadata,d.file_name,d.file_type,d.source_path,1-(c.embedding <=> CAST(:vector AS vector)) score FROM aplus_chunks c JOIN aplus_documents d ON d.id=c.document_id WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant ORDER BY c.embedding <=> CAST(:vector AS vector) LIMIT :limit"""
            ),
            {"vector": json.dumps(vector), "tenant": tenant, "limit": limit},
        )
        return [dict(row) for row in result.mappings().all()]

    async def replace_document(
        self,
        file: Any,
        tenant: str,
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Replaces one RAG document and its chunks without committing the transaction."""
        result = await self.db.execute(
            text(
                """INSERT INTO aplus_documents (tenant_code, source_path, file_name, file_type, "type", tag, file_hash, file_size, status, updated_at)
                    VALUES (:tenant, :source, :name, :file_type, :document_type, '', :file_hash, :file_size, 'processing', CURRENT_TIMESTAMP)
                    ON CONFLICT (tenant_code, source_path) DO UPDATE SET file_name=EXCLUDED.file_name, file_type=EXCLUDED.file_type, "type"=EXCLUDED."type", file_hash=EXCLUDED.file_hash, file_size=EXCLUDED.file_size, status='processing', error=NULL, updated_at=CURRENT_TIMESTAMP
                    RETURNING id"""
            ),
            {
                "tenant": tenant,
                "source": file.source_path,
                "name": file.file_name,
                "file_type": file.file_type,
                "document_type": file.document_type,
                "file_hash": file.file_hash,
                "file_size": file.file_size,
            },
        )
        document_id = int(result.scalar_one())
        await self.db.execute(
            text(
                "DELETE FROM aplus_chunks WHERE tenant_code=:tenant AND document_id=:document_id"
            ),
            {"tenant": tenant, "document_id": document_id},
        )
        for index, chunk in enumerate(chunks):
            await self.db.execute(
                text(
                    "INSERT INTO aplus_chunks (tenant_code, document_id, chunk_index, content, metadata, embedding) VALUES (:tenant, :document_id, :chunk_index, :content, CAST(:metadata AS jsonb), CAST(:embedding AS vector))"
                ),
                {
                    "tenant": tenant,
                    "document_id": document_id,
                    "chunk_index": index,
                    "content": chunk["content"],
                    "metadata": json.dumps(chunk["metadata"], ensure_ascii=False),
                    "embedding": json.dumps(vectors[index]),
                },
            )
        await self.db.execute(
            text(
                "UPDATE aplus_documents SET chunk_count=:count, status='ready', error=NULL, updated_at=CURRENT_TIMESTAMP, ingested_at=CURRENT_TIMESTAMP WHERE id=:document_id AND tenant_code=:tenant"
            ),
            {"count": len(chunks), "document_id": document_id, "tenant": tenant},
        )
        return document_id
