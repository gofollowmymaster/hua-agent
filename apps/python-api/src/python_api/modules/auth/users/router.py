from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.database import get_db
from python_api.modules.auth.dependencies import require_system_admin
from python_api.modules.auth.users.schemas import (
    CreateUserRequest,
    QueryUsersRequest,
    ResetPasswordRequest,
    UpdateUserRequest,
)
from python_api.modules.auth.users.service import AuthUserService

router = APIRouter(
    prefix="/auth/users",
    tags=["auth"],
    dependencies=[Depends(require_system_admin)],
)


@router.post("/page")
async def list_users(
    body: QueryUsersRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Returns the current tenant's user page."""
    return await AuthUserService(db).list_users(body)


@router.post("")
async def create_user(
    body: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Creates a local user in the current tenant."""
    return await AuthUserService(db).create_user(body)


@router.post("/{user_id}")
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Updates a tenant-local user."""
    return await AuthUserService(db).update_user(user_id, body)


@router.post("/{user_id}/password")
async def reset_password(
    user_id: int,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Resets a tenant-local user's password."""
    await AuthUserService(db).reset_password(user_id, body)
