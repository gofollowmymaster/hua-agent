from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.database import get_db
from python_api.schemas.auth import (
    CreateUserRequest,
    LoginRequest,
    QueryUsersRequest,
    ResetPasswordRequest,
    UpdateUserRequest,
)
from python_api.security import require_system_admin
from python_api.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Authenticates a local tenant user."""
    return await AuthService(db).login(body)


@router.post("/users/page", dependencies=[Depends(require_system_admin)])
async def list_users(body: QueryUsersRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Returns the current tenant's user page."""
    return await AuthService(db).list_users(body)


@router.post("/users", dependencies=[Depends(require_system_admin)])
async def create_user(
    body: CreateUserRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Creates a local user in the current tenant."""
    return await AuthService(db).create_user(body)


@router.post("/users/{user_id}", dependencies=[Depends(require_system_admin)])
async def update_user(
    user_id: int, body: UpdateUserRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Updates a tenant-local user."""
    return await AuthService(db).update_user(user_id, body)


@router.post("/users/{user_id}/password", dependencies=[Depends(require_system_admin)])
async def reset_password(
    user_id: int, body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
) -> None:
    """Resets a tenant-local user's password."""
    await AuthService(db).reset_password(user_id, body)
