from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True, slots=True)
class DigitalAvatarSource:
    """Describes a managed txt file before it is indexed."""

    absolute_path: Path
    source_path: str
    file_name: str
    file_hash: str
    file_size: int


class DigitalAvatarRepository:
    """Owns parameterized writes for digital avatar documents and vectors."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def replace_document(
        self,
        source: DigitalAvatarSource,
        summary: str,
        chunks: list[dict[str, Any]],
        vectors: list[list[float]],
    ) -> int:
        """Atomically replaces one document and its ordered chunks."""
        result = await self.db.execute(
            text(
                """INSERT INTO digital_avatar_documents
                   (source_path,file_name,file_type,file_hash,file_size,summary,status,updated_at)
                   VALUES (:source,:name,'txt',:hash,:size,:summary,'processing',CURRENT_TIMESTAMP)
                   ON CONFLICT (source_path) DO UPDATE SET
                     file_name=EXCLUDED.file_name,file_type='txt',file_hash=EXCLUDED.file_hash,
                     file_size=EXCLUDED.file_size,summary=EXCLUDED.summary,status='processing',
                     error=NULL,updated_at=CURRENT_TIMESTAMP
                   RETURNING id"""
            ),
            {
                "source": source.source_path,
                "name": source.file_name,
                "hash": source.file_hash,
                "size": source.file_size,
                "summary": summary,
            },
        )
        document_id = int(result.scalar_one())
        await self.db.execute(
            text("DELETE FROM digital_avatar_chunks WHERE document_id=:document_id"),
            {"document_id": document_id},
        )
        for index, chunk in enumerate(chunks):
            await self.db.execute(
                text(
                    """INSERT INTO digital_avatar_chunks
                       (document_id,chunk_index,content,metadata,embedding)
                       VALUES (:document_id,:chunk_index,:content,CAST(:metadata AS jsonb),
                               CAST(:embedding AS vector))"""
                ),
                {
                    "document_id": document_id,
                    "chunk_index": index,
                    "content": chunk["content"],
                    "metadata": json.dumps(chunk["metadata"], ensure_ascii=False),
                    "embedding": json.dumps(vectors[index]),
                },
            )
        await self.db.execute(
            text(
                """UPDATE digital_avatar_documents
                   SET chunk_count=:count,status='ready',error=NULL,
                       updated_at=CURRENT_TIMESTAMP,ingested_at=CURRENT_TIMESTAMP
                   WHERE id=:document_id"""
            ),
            {"count": len(chunks), "document_id": document_id},
        )
        return document_id

    async def mark_failed(self, source: DigitalAvatarSource, reason: str) -> None:
        """Persists a bounded failure state for a managed source file."""
        await self.db.execute(
            text(
                """INSERT INTO digital_avatar_documents
                   (source_path,file_name,file_type,file_hash,file_size,summary,chunk_count,status,error,updated_at)
                   VALUES (:source,:name,'txt',:hash,:size,'',0,'failed',:error,CURRENT_TIMESTAMP)
                   ON CONFLICT (source_path) DO UPDATE SET
                     file_name=EXCLUDED.file_name,file_type='txt',file_hash=EXCLUDED.file_hash,
                     file_size=EXCLUDED.file_size,status='failed',
                     error=EXCLUDED.error,updated_at=CURRENT_TIMESTAMP"""
            ),
            {
                "source": source.source_path,
                "name": source.file_name,
                "hash": source.file_hash,
                "size": source.file_size,
                "error": reason[:2000],
            },
        )
