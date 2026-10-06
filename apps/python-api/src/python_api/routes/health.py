from fastapi import APIRouter

from python_api.core.redis.redis_service import redis_ready
from python_api.database import database_ready

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
async def live() -> dict[str, str]:
    """Reports whether the HTTP process can serve requests."""
    return {"status": "ok"}


@router.get("/ready")
async def ready() -> dict[str, object]:
    """Reports readiness of the shared database and Redis dependencies."""
    database, redis = await database_ready(), await redis_ready()
    return {
        "status": "ok" if database and redis else "not_ready",
        "configuration": True,
        "database": database,
        "redis": redis,
    }
