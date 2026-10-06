from __future__ import annotations

import time
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.config import get_settings
from python_api.context import get_request_context
from python_api.errors import NotReportError
from python_api.models import RagAdminUser
from python_api.schemas.auth import (
    CreateUserRequest,
    LoginRequest,
    QueryUsersRequest,
    ResetPasswordRequest,
    UpdateUserRequest,
)
from python_api.schemas.common import json_value
from python_api.security import create_access_token, hash_password, verify_password

TENANT_IDENTITIES = {
    "aplus": {"supplierCode": "A", "supplierName": "Aplus", "tenantName": "Aplus"},
    "boat": {"supplierCode": "C", "supplierName": "Boat", "tenantName": "Boat"},
    "yurex": {"supplierCode": "D", "supplierName": "Yurex", "tenantName": "Yurex"},
}


class AuthService:
    """Manages local identities and cross-backend compatible JWTs."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def login(self, request: LoginRequest) -> dict[str, str]:
        """Checks tenant credentials and issues a compatible access token."""
        tenant = get_request_context().tenant_code
        user = await self.db.scalar(
            select(RagAdminUser).where(
                RagAdminUser.tenant_code == tenant,
                RagAdminUser.username == request.username.strip(),
            )
        )
        if (
            not user
            or not user.is_enabled
            or not await verify_password(request.password, user.password_hash)
        ):
            raise NotReportError("无效账号或密码", 401)
        return {"token": self._create_token(user)}

    async def list_users(self, request: QueryUsersRequest) -> dict[str, Any]:
        """Returns a tenant-scoped page without password hashes."""
        tenant = get_request_context().tenant_code
        filters: list[Any] = [RagAdminUser.tenant_code == tenant]
        keyword = request.keyword.strip() if request.keyword else ""
        if keyword:
            pattern = f"%{keyword}%"
            filters.append(
                or_(RagAdminUser.username.ilike(pattern), RagAdminUser.display_name.ilike(pattern))
            )
        total = await self.db.scalar(select(func.count()).select_from(RagAdminUser).where(*filters))
        users = (
            await self.db.scalars(
                select(RagAdminUser)
                .where(*filters)
                .order_by(RagAdminUser.created_at.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).all()
        return {
            "list": [self._summary(user) for user in users],
            "total": total or 0,
            "page": request.page,
            "pageSize": request.page_size,
        }

    async def create_user(self, request: CreateUserRequest) -> dict[str, Any]:
        """Creates an enabled non-admin identity in the current tenant."""
        tenant = get_request_context().tenant_code
        username = request.username.strip()
        existing = await self.db.scalar(
            select(RagAdminUser.id).where(
                RagAdminUser.tenant_code == tenant, RagAdminUser.username == username
            )
        )
        if existing:
            from fastapi import HTTPException

            raise HTTPException(400, "用户名已存在")
        identity = TENANT_IDENTITIES[tenant]
        user = RagAdminUser(
            tenant_code=tenant,
            supplier_code=identity["supplierCode"],
            username=username,
            display_name=request.display_name.strip(),
            password_hash=await hash_password(request.password),
            is_enabled=True,
            is_system_admin=False,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return self._summary(user)

    async def update_user(self, user_id: int, request: UpdateUserRequest) -> dict[str, Any]:
        """Updates only supplied mutable fields for a tenant-local identity."""
        user = await self._find_user(user_id)
        if request.display_name is not None:
            user.display_name = request.display_name.strip()
        if request.is_enabled is not None:
            user.is_enabled = request.is_enabled
        await self.db.commit()
        await self.db.refresh(user)
        return self._summary(user)

    async def reset_password(self, user_id: int, request: ResetPasswordRequest) -> None:
        """Replaces the stored scrypt hash for a tenant-local identity."""
        user = await self._find_user(user_id)
        user.password_hash = await hash_password(request.password)
        await self.db.commit()

    async def _find_user(self, user_id: int) -> RagAdminUser:
        user = await self.db.scalar(
            select(RagAdminUser).where(
                RagAdminUser.id == user_id,
                RagAdminUser.tenant_code == get_request_context().tenant_code,
            )
        )
        if not user:
            raise NotReportError("用户不存在", 404)
        return user

    def _create_token(self, user: RagAdminUser) -> str:
        identity = TENANT_IDENTITIES[user.tenant_code]
        return create_access_token(
            {
                "userId": user.id,
                "userCode": user.username,
                "username": user.display_name,
                "loginId": user.username,
                "supplierCode": user.supplier_code,
                "supplierName": identity["supplierName"],
                "tenantCode": user.tenant_code,
                "tenantName": identity["tenantName"],
                "appCode": "ADMIN",
                "scope": "WEB",
                "isSystemAdmin": user.is_system_admin,
                "loginTime": int(time.time()),
            }
        )

    def _summary(self, user: RagAdminUser) -> dict[str, Any]:
        return json_value(
            {
                "id": user.id,
                "username": user.username,
                "displayName": user.display_name,
                "isEnabled": user.is_enabled,
                "isSystemAdmin": user.is_system_admin,
                "createdAt": user.created_at,
                "updatedAt": user.updated_at,
            }
        )


async def bootstrap_admin() -> None:
    """Creates or resets the configured administrator with startup idempotence."""
    from python_api.database import session_factory

    settings = get_settings()
    username = settings.rag_admin_bootstrap_username
    password = (
        settings.rag_admin_bootstrap_password.get_secret_value()
        if settings.rag_admin_bootstrap_password
        else ""
    )
    if not username and not password:
        return
    if not username or not password:
        raise NotReportError(
            "RAG_ADMIN_BOOTSTRAP_USERNAME and RAG_ADMIN_BOOTSTRAP_PASSWORD must be configured together",
            500,
        )
    if not 8 <= len(password) <= 128:
        raise NotReportError(
            "RAG_ADMIN_BOOTSTRAP_PASSWORD must be between 8 and 128 characters", 500
        )
    tenant = {"A": "aplus", "C": "boat", "D": "yurex"}.get(
        settings.rag_admin_bootstrap_supplier_code.upper()
    )
    if not tenant:
        raise NotReportError("RAG_ADMIN_BOOTSTRAP_SUPPLIER_CODE must be A, C, or D", 500)
    async with session_factory() as db:
        user = await db.scalar(
            select(RagAdminUser).where(
                RagAdminUser.tenant_code == tenant, RagAdminUser.username == username
            )
        )
        if not user:
            identity = TENANT_IDENTITIES[tenant]
            db.add(
                RagAdminUser(
                    tenant_code=tenant,
                    supplier_code=identity["supplierCode"],
                    username=username,
                    display_name=settings.rag_admin_bootstrap_display_name or username,
                    password_hash=await hash_password(password),
                    is_enabled=True,
                    is_system_admin=True,
                )
            )
        elif settings.rag_admin_bootstrap_reset_password:
            user.display_name = settings.rag_admin_bootstrap_display_name or user.display_name
            user.password_hash = await hash_password(password)
            user.is_enabled = True
            user.is_system_admin = True
        await db.commit()
