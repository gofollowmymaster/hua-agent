from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from python_api.core.model_base import Base


class RagAdminUser(Base):
    """Maps local RAG Admin identities without owning migrations."""

    __tablename__ = "rag_admin_users"
    __table_args__ = (UniqueConstraint("tenant_code", "username"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_code: Mapped[str] = mapped_column(Text)
    supplier_code: Mapped[str] = mapped_column(Text)
    username: Mapped[str] = mapped_column(Text)
    display_name: Mapped[str] = mapped_column(Text)
    password_hash: Mapped[str] = mapped_column(Text)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_system_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
