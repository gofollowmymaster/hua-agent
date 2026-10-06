from __future__ import annotations

from dataclasses import dataclass

from fastapi import Request
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker

from python_api.core.config import Settings
from python_api.core.database import create_database_engine
from python_api.integrations.feishu import ClientSecretTable, FeishuAlertService, FeishuClient
from python_api.integrations.redis import RedisService, create_redis_client


@dataclass(slots=True)
class AppResources:
    """Owns process-wide clients that are created and closed by application lifespan."""

    settings: Settings
    engine: AsyncEngine
    session_factory: async_sessionmaker
    redis_client: Redis
    redis: RedisService
    feishu: FeishuClient
    client_secret_table: ClientSecretTable
    feishu_alerts: FeishuAlertService

    async def close(self) -> None:
        """Closes external connection pools in reverse construction order."""
        await self.redis_client.aclose()
        await self.engine.dispose()


def create_app_resources(settings: Settings) -> AppResources:
    """Builds the default resource graph for one application instance."""
    engine = create_database_engine(settings)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    redis_client = create_redis_client(settings)
    redis = RedisService(redis_client)
    feishu = FeishuClient(settings)
    return AppResources(
        settings=settings,
        engine=engine,
        session_factory=session_factory,
        redis_client=redis_client,
        redis=redis,
        feishu=feishu,
        client_secret_table=ClientSecretTable(settings, redis, feishu),
        feishu_alerts=FeishuAlertService(settings, feishu),
    )


def get_resources(request: Request) -> AppResources:
    """Returns resources owned by the current FastAPI application."""
    return request.app.state.resources


def get_app_settings(request: Request) -> Settings:
    """Provides settings owned by the current application instance."""
    return get_resources(request).settings


def get_redis(request: Request) -> RedisService:
    """Provides the lifespan-owned Redis adapter to route dependencies."""
    return get_resources(request).redis
