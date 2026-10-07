from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from python_api.core.model_base import Base


class AgentUserSkill(Base):
    """Maps Prisma-owned private user Skills without creating migrations."""

    __tablename__ = "agent_user_skills"
    __table_args__ = (
        UniqueConstraint(
            "tenant_code",
            "user_id",
            "name",
            name="agent_user_skills_tenant_user_name_key",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("rag_admin_users.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(String(500), default="")
    instruction: Mapped[str] = mapped_column(Text)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AgentDocument(Base):
    """Maps business Agent documents and Feishu synchronization metadata."""

    __tablename__ = "agent_documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Text)
    source_path: Mapped[str] = mapped_column(Text)
    file_name: Mapped[str] = mapped_column(Text)
    file_type: Mapped[str] = mapped_column(Text)
    file_hash: Mapped[str] = mapped_column(Text)
    file_size: Mapped[int] = mapped_column(BigInteger)
    content: Mapped[str] = mapped_column(Text, default="", deferred=True)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(Text, default="ready")
    error: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    remote_url: Mapped[str | None] = mapped_column(Text)
    doc_id: Mapped[str | None] = mapped_column(Text)
    wiki_node_id: Mapped[str | None] = mapped_column(Text)
    last_modified_at: Mapped[str | None] = mapped_column(Text)
    breadcrumb: Mapped[str | None] = mapped_column(Text)
    source_type: Mapped[str | None] = mapped_column(Text)
    current_version: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    chunks: Mapped[list[AgentChunk]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class AgentChunk(Base):
    """Maps business Agent chunks."""

    __tablename__ = "agent_chunks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    document_id: Mapped[int] = mapped_column(ForeignKey("agent_documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    embedding: Mapped[Any] = mapped_column(String, deferred=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    document: Mapped[AgentDocument] = relationship(back_populates="chunks")


class AgentChatSession(Base):
    """Maps persisted business Agent sessions."""

    __tablename__ = "agent_chat_sessions"

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


class AgentChatMessage(Base):
    """Maps ordered Agent chat messages and visible parts."""

    __tablename__ = "agent_chat_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("agent_chat_sessions.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    tool_calls: Mapped[Any] = mapped_column(JSONB, default=dict)
    parts: Mapped[Any | None] = mapped_column(JSONB)
    sender_id: Mapped[str | None] = mapped_column(Text)
    external_message_id: Mapped[str | None] = mapped_column(Text)
    reply_to_message_id: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
