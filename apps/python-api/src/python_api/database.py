from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from python_api.config import get_settings

settings = get_settings()
engine = create_async_engine(settings.async_database_url, pool_pre_ping=True)
session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    """Provides one transaction-capable SQLAlchemy session per request."""
    async with session_factory() as session:
        yield session


async def database_ready() -> bool:
    """Checks database connectivity without modifying shared state."""
    from sqlalchemy import text

    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
