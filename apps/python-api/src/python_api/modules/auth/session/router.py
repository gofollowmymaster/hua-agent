from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.database import get_db
from python_api.core.resources import get_app_settings
from python_api.modules.auth.session.schemas import LoginRequest
from python_api.modules.auth.session.service import AuthSessionService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Authenticates a local tenant user."""
    return await AuthSessionService(db, settings).login(body)
