from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any, TypeVar, cast

from redis.asyncio import Redis

from python_api.config import Settings, get_settings
from python_api.context import get_request_context

T = TypeVar("T")

FEISHU_MTABLE = "frontend-node:mtable:{appToken}:{tableId}"
RATE_LIMITER = "frontend-node:limiter:{key}"
REDIS_IDEMPOTENT = "frontend-node:idempotent:{key}"
FEISHU_API_CACHE = "frontend-node:{tenant}:feishu-api:{apiName}"
RAG_SESSION_MEMORY = "frontend-node:{tenant}:rag:memory:{channel}:{sessionKey}"


class RedisService:
    """Implements the Redis key and state semantics used by the NestJS service."""

    def __init__(self, client: Redis) -> None:
        self.client = client

    def build_key(self, template: str, **values: str) -> str:
        """Expands a shared key template with the current tenant and values."""
        result = template.replace("{tenant}", get_request_context().tenant_code)
        for name, value in values.items():
            result = result.replace("{" + name + "}", value)
        return result

    async def limiter(self, key: str, limit: int, ttl: int) -> bool:
        """Returns true only after the shared counter exceeds its limit."""
        redis_key = RATE_LIMITER.replace("{key}", key)
        current = await self.client.incr(redis_key)
        if current == 1:
            await self.client.expire(redis_key, ttl)
        return current > limit

    async def idempotent(
        self, tag: str, handler: Callable[[], Awaitable[T]], expire_time: int = 86_400
    ) -> T | None:
        """Runs a handler once within the compatible handling/handled window."""
        key = REDIS_IDEMPOTENT.replace("{key}", tag)
        status = await self.client.get(key)
        if status in {b"handling", b"handled", "handling", "handled"}:
            return None
        await self.client.setex(key, expire_time, "handling")
        try:
            result = await handler()
            await self.client.setex(key, expire_time, "handled")
            return result
        except Exception:
            await self.client.setex(key, expire_time, "failed")
            return None

    async def values_by_pattern(self, pattern: str, value_type: str = "string") -> dict[str, Any]:
        """Reads matching keys using SCAN and the requested Redis value type."""
        methods = {
            "string": self.client.get,
            "hash": self.client.hgetall,
            "set": self.client.smembers,
            "zset": lambda key: self.client.zrange(key, 0, -1),
            "list": lambda key: self.client.lrange(key, 0, -1),
        }
        result: dict[str, Any] = {}
        async for key in self.client.scan_iter(match=pattern, count=100):
            decoded = key.decode() if isinstance(key, bytes) else key
            result[decoded] = await cast(Awaitable[Any], methods[value_type](key))
        return result

    async def delete_by_pattern(self, pattern: str) -> int:
        """Deletes a sufficiently specific pattern using bounded SCAN batches."""
        if len(pattern) < 20:
            raise ValueError("pattern must be greater than 10")
        deleted = 0
        batch: list[Any] = []
        async for key in self.client.scan_iter(match=pattern, count=100):
            batch.append(key)
            if len(batch) == 100:
                deleted += await self.client.delete(*batch)
                batch.clear()
        if batch:
            deleted += await self.client.delete(*batch)
        return deleted


def create_redis_client(settings: Settings) -> Redis:
    """Creates a Redis client from canonical connection and timeout settings."""
    password = settings.redis_password.get_secret_value() if settings.redis_password else None
    return Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        db=settings.redis_db,
        password=password,
        decode_responses=True,
        max_connections=settings.redis_max_connections,
        socket_connect_timeout=settings.redis_connect_timeout_seconds,
        socket_timeout=settings.redis_read_timeout_seconds,
        health_check_interval=settings.redis_health_check_interval_seconds,
    )


redis_client = create_redis_client(get_settings())
redis_service = RedisService(redis_client)


async def redis_ready() -> bool:
    """Checks Redis connectivity without changing keys."""
    try:
        return bool(await redis_client.ping())
    except Exception:
        return False
