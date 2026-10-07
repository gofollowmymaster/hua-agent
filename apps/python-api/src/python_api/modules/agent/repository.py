from __future__ import annotations

import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession


class AgentRepository:
    """Owns low-level SQL required by Agent persistence."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def upsert_chat_session(self, session: ResolvedSession) -> int:
        """Creates or refreshes an Agent chat session and returns its identifier."""
        result = await self.db.execute(
            text(
                """INSERT INTO agent_chat_sessions (tenant_code,channel,session_key,user_id,conversation_id,conversation_type,metadata,last_active_at,updated_at) VALUES (:tenant,:channel,:key,:user_id,:conversation_id,:conversation_type,CAST(:metadata AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,channel,session_key) DO UPDATE SET user_id=EXCLUDED.user_id,conversation_id=EXCLUDED.conversation_id,conversation_type=EXCLUDED.conversation_type,metadata=EXCLUDED.metadata,last_active_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP RETURNING id"""
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

    async def search_fulltext_chunks(
        self, query: str, tenant: str, category: str | None, limit: int
    ) -> list[dict[str, Any]]:
        """Returns tenant-scoped Agent chunks ranked by zhparser relevance."""
        result = await self.db.execute(
            text(
                """WITH keyword_terms AS (SELECT DISTINCT term.lexeme FROM ts_debug('zhparser', :query) debug CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme) WHERE term.lexeme <> ''), keyword_query AS (SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query FROM keyword_terms)
                SELECT c.id,c.tenant_code,c.document_id,c.chunk_index,c.content,c.metadata,d.category,d.file_name,d.source_path,d.remote_url,d.doc_id,d.wiki_node_id,d.last_modified_at,d.breadcrumb,d.source_type,d.current_version,ts_rank_cd(to_tsvector('zhparser', c.content), keyword_query.query) AS score
                FROM agent_chunks c JOIN agent_documents d ON d.id=c.document_id CROSS JOIN keyword_query WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) AND keyword_query.query IS NOT NULL AND to_tsvector('zhparser', c.content) @@ keyword_query.query ORDER BY score DESC,c.id ASC LIMIT :limit"""
            ),
            {"query": query, "tenant": tenant, "category": category, "limit": limit},
        )
        return [dict(row) for row in result.mappings().all()]

    async def search_vector_chunks(
        self,
        vector: list[float],
        tenant: str,
        category: str | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        """Returns tenant-scoped Agent chunks nearest to an embedding."""
        result = await self.db.execute(
            text(
                """SELECT c.id,c.tenant_code,c.document_id,c.chunk_index,c.content,c.metadata,d.category,d.file_name,d.source_path,d.remote_url,d.doc_id,d.wiki_node_id,d.last_modified_at,d.breadcrumb,d.source_type,d.current_version,1-(c.embedding <=> CAST(:vector AS vector)) AS score FROM agent_chunks c JOIN agent_documents d ON d.id=c.document_id WHERE c.tenant_code=:tenant AND d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) ORDER BY c.embedding <=> CAST(:vector AS vector) LIMIT :limit"""
            ),
            {
                "vector": json.dumps(vector),
                "tenant": tenant,
                "category": category,
                "limit": limit,
            },
        )
        return [dict(row) for row in result.mappings().all()]

    async def page_document_ids_by_keyword(
        self,
        keyword: str,
        tenant: str,
        category: str | None,
        status: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[int], int]:
        """Returns ordered document identifiers and total count for keyword paging."""
        result = await self.db.execute(
            text(
                """WITH keyword_terms AS (SELECT DISTINCT term.lexeme FROM ts_debug('zhparser', :keyword) debug CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme) WHERE term.lexeme<>''), keyword_query AS (SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query FROM keyword_terms), matches AS (SELECT d.id,d.updated_at FROM agent_documents d CROSS JOIN keyword_query WHERE d.tenant_code=:tenant AND (CAST(:category AS text) IS NULL OR d.category=:category) AND (CAST(:status AS text) IS NULL OR d.status=:status) AND (strpos(d.file_name,:keyword)>0 OR strpos(d.source_path,:keyword)>0 OR strpos(COALESCE(d.breadcrumb,''),:keyword)>0 OR (keyword_query.query IS NOT NULL AND EXISTS (SELECT 1 FROM agent_chunks c WHERE c.tenant_code=:tenant AND c.document_id=d.id AND to_tsvector('zhparser',c.content) @@ keyword_query.query)))) SELECT id, count(*) OVER() AS total FROM matches ORDER BY updated_at DESC,id DESC LIMIT :limit OFFSET :offset"""
            ),
            {
                "keyword": keyword,
                "tenant": tenant,
                "category": category,
                "status": status,
                "limit": limit,
                "offset": offset,
            },
        )
        rows = result.mappings().all()
        return [int(row["id"]) for row in rows], int(rows[0]["total"]) if rows else 0

    async def replace_document(
        self,
        *,
        tenant: str,
        category: str,
        source: str,
        file_name: str,
        file_hash: str,
        file_size: int,
        content: str,
        metadata: dict[str, str],
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Replaces one Agent document and its chunks without committing the transaction."""

        def value(key: str) -> str:
            return metadata.get(key, "").strip()

        result = await self.db.execute(
            text(
                """INSERT INTO agent_documents (tenant_code,category,source_path,file_name,file_type,file_hash,file_size,content,status,metadata,remote_url,doc_id,wiki_node_id,last_modified_at,breadcrumb,source_type,current_version,updated_at) VALUES (:tenant,:category,:source,:name,'md',:hash,:size,:content,'processing',CAST(:metadata AS jsonb),:remote,:doc_id,:wiki,:modified,:breadcrumb,:source_type,:version,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,source_path) DO UPDATE SET category=EXCLUDED.category,file_name=EXCLUDED.file_name,file_hash=EXCLUDED.file_hash,file_size=EXCLUDED.file_size,content=EXCLUDED.content,status='processing',error=NULL,metadata=EXCLUDED.metadata,remote_url=EXCLUDED.remote_url,doc_id=EXCLUDED.doc_id,wiki_node_id=EXCLUDED.wiki_node_id,last_modified_at=EXCLUDED.last_modified_at,breadcrumb=EXCLUDED.breadcrumb,source_type=EXCLUDED.source_type,current_version=EXCLUDED.current_version,updated_at=CURRENT_TIMESTAMP RETURNING id"""
            ),
            {
                "tenant": tenant,
                "category": category,
                "source": source,
                "name": file_name,
                "hash": file_hash,
                "size": file_size,
                "content": content,
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
            {"tenant": tenant, "id": document_id},
        )
        for index, chunk in enumerate(chunks):
            await self.db.execute(
                text(
                    "INSERT INTO agent_chunks (tenant_code,document_id,chunk_index,content,metadata,embedding) VALUES (:tenant,:id,:idx,:content,CAST(:metadata AS jsonb),CAST(:embedding AS vector))"
                ),
                {
                    "tenant": tenant,
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
            {"count": len(chunks), "id": document_id, "tenant": tenant},
        )
        return document_id

    async def mark_document_failed(
        self,
        *,
        tenant: str,
        category: str,
        source: str,
        file_name: str,
        file_hash: str,
        file_size: int,
        content: str,
        metadata: dict[str, str],
        error: str,
    ) -> None:
        """Persists one failed Agent document while retaining its original text."""

        def value(key: str) -> str:
            return metadata.get(key, "").strip()

        await self.db.execute(
            text(
                """INSERT INTO agent_documents (tenant_code,category,source_path,file_name,file_type,file_hash,file_size,content,chunk_count,status,error,metadata,remote_url,doc_id,wiki_node_id,last_modified_at,breadcrumb,source_type,current_version,updated_at) VALUES (:tenant,:category,:source,:name,'md',:hash,:size,:content,0,'failed',:error,CAST(:metadata AS jsonb),:remote,:doc_id,:wiki,:modified,:breadcrumb,:source_type,:version,CURRENT_TIMESTAMP) ON CONFLICT (tenant_code,source_path) DO UPDATE SET category=EXCLUDED.category,file_name=EXCLUDED.file_name,file_hash=EXCLUDED.file_hash,file_size=EXCLUDED.file_size,content=EXCLUDED.content,chunk_count=0,status='failed',error=EXCLUDED.error,metadata=EXCLUDED.metadata,remote_url=EXCLUDED.remote_url,doc_id=EXCLUDED.doc_id,wiki_node_id=EXCLUDED.wiki_node_id,last_modified_at=EXCLUDED.last_modified_at,breadcrumb=EXCLUDED.breadcrumb,source_type=EXCLUDED.source_type,current_version=EXCLUDED.current_version,updated_at=CURRENT_TIMESTAMP"""
            ),
            {
                "tenant": tenant,
                "category": category,
                "source": source,
                "name": file_name,
                "hash": file_hash,
                "size": file_size,
                "content": content,
                "error": error,
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
