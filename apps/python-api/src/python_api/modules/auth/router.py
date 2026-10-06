from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.database import get_db
from python_api.core.resources import get_app_settings
from python_api.modules.auth.dependencies import require_system_admin
from python_api.modules.auth.schemas import (
    CreateUserRequest,
    LoginRequest,
    QueryUsersRequest,
    ResetPasswordRequest,
    UpdateUserRequest,
)
from python_api.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Authenticates a local tenant user."""
    return await AuthService(db, settings).login(body)


@router.post("/users/page", dependencies=[Depends(require_system_admin)])
async def list_users(
    body: QueryUsersRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Returns the current tenant's user page."""
    return await AuthService(db, settings).list_users(body)


@router.post("/users", dependencies=[Depends(require_system_admin)])
async def create_user(
    body: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Creates a local user in the current tenant."""
    return await AuthService(db, settings).create_user(body)


@router.post("/users/{user_id}", dependencies=[Depends(require_system_admin)])
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict[str, Any]:
    """Updates a tenant-local user."""
    return await AuthService(db, settings).update_user(user_id, body)


@router.post("/users/{user_id}/password", dependencies=[Depends(require_system_admin)])
async def reset_password(
    user_id: int,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> None:
    """Resets a tenant-local user's password."""
    await AuthService(db, settings).reset_password(user_id, body)
