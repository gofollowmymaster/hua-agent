from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from python_api.core.model_base import Base


class AplusDocument(Base):
    """Maps documents used by the knowledge QA workflow."""

    __tablename__ = "aplus_documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    source_path: Mapped[str] = mapped_column(Text)
    file_name: Mapped[str] = mapped_column(Text)
    file_type: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(Text, default="")
    tag: Mapped[str] = mapped_column(Text, default="")
    file_hash: Mapped[str] = mapped_column(Text)
    file_size: Mapped[int] = mapped_column(BigInteger)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(Text, default="ready")
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    chunks: Mapped[list[AplusChunk]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class AplusChunk(Base):
    """Maps RAG chunks while vector writes remain parameterized raw SQL."""

    __tablename__ = "aplus_chunks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    document_id: Mapped[int] = mapped_column(ForeignKey("aplus_documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    embedding: Mapped[Any] = mapped_column(String, deferred=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    document: Mapped[AplusDocument] = relationship(back_populates="chunks")


class AplusRagSession(Base):
    """Maps knowledge QA sessions."""

    __tablename__ = "aplus_rag_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(Text)
    session_key: Mapped[str] = mapped_column(Text)
    user_id: Mapped[str | None] = mapped_column(Text)
    conversation_id: Mapped[str | None] = mapped_column(Text)
    conversation_type: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AplusRagMessage(Base):
    """Maps knowledge QA messages."""

    __tablename__ = "aplus_rag_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    session_id: Mapped[int] = mapped_column(ForeignKey("aplus_rag_sessions.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    sender_id: Mapped[str | None] = mapped_column(Text)
    external_message_id: Mapped[str | None] = mapped_column(Text)
    reply_to_message_id: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
