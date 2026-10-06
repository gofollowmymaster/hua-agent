from __future__ import annotations

from collections.abc import AsyncIterator

from fastapi import Request
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)

from python_api.core.config import Settings


def create_database_engine(settings: Settings) -> AsyncEngine:
    """Creates the shared database engine from validated pool settings."""
    return create_async_engine(
        settings.async_database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout_seconds,
        pool_recycle=settings.database_pool_recycle_seconds,
        pool_pre_ping=settings.database_pool_pre_ping,
    )


async def get_db(request: Request) -> AsyncIterator[AsyncSession]:
    """Provides one transaction-capable SQLAlchemy session per request."""
    async with request.app.state.resources.session_factory() as session:
        yield session


async def database_ready(engine: AsyncEngine) -> bool:
    """Checks database connectivity without modifying shared state."""
    from sqlalchemy import text

    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
