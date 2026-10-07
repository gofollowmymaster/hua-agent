from __future__ import annotations

import time
from collections.abc import Callable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.config import Settings
from python_api.core.context import get_request_context
from python_api.core.errors import NotReportError
from python_api.modules.auth.dependencies import create_access_token, verify_password
from python_api.modules.auth.identity import TENANT_IDENTITIES
from python_api.modules.auth.models import RagAdminUser
from python_api.modules.auth.session.schemas import LoginRequest


class AuthSessionService:
    """Authenticates local users and issues access tokens."""

    def __init__(
        self,
        db: AsyncSession,
        settings: Settings | None = None,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.db = db
        self.settings = settings
        self.clock = clock

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

    def _create_token(self, user: RagAdminUser) -> str:
        """Builds the JWT claims expected by existing API and frontend consumers."""
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
                "loginTime": int(self.clock()),
            },
            self.settings,
        )
