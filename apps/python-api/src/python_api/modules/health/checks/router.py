from fastapi import APIRouter, Depends

from python_api.core.database import database_ready
from python_api.core.resources import AppResources, get_resources
from python_api.integrations.redis import redis_ready

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
async def live() -> dict[str, str]:
    """Reports whether the HTTP process can serve requests."""
    return {"status": "ok"}


@router.get("/ready")
async def ready(resources: AppResources = Depends(get_resources)) -> dict[str, object]:
    """Reports readiness of the shared database and Redis dependencies."""
    database = await database_ready(resources.engine)
    redis = await redis_ready(resources.redis_client)
    return {
        "status": "ok" if database and redis else "not_ready",
        "configuration": True,
        "database": database,
        "redis": redis,
    }
