from __future__ import annotations

import base64
import hashlib
import hmac
import os
import time
from collections.abc import Callable
from typing import Any

import jwt
from fastapi import Depends, HTTPException, Request

from python_api.core.concurrency import run_file_work
from python_api.core.config import Settings, get_settings
from python_api.core.context import get_request_context
from python_api.core.resources import get_resources

KEY_LENGTH = 64


async def hash_password(password: str) -> str:
    """Creates a hash compatible with Node.js crypto.scrypt defaults."""
    salt = os.urandom(16)
    key = await run_file_work(
        hashlib.scrypt, password.encode(), salt=salt, n=16384, r=8, p=1, dklen=KEY_LENGTH
    )
    return f"scrypt${base64.b64encode(salt).decode()}${base64.b64encode(key).decode()}"


async def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies hashes written by either backend without leaking timing."""
    try:
        version, encoded_salt, encoded_key = stored_hash.split("$")
        if version != "scrypt":
            return False
        salt = base64.b64decode(encoded_salt)
        expected = base64.b64decode(encoded_key)
        actual = await run_file_work(
            hashlib.scrypt, password.encode(), salt=salt, n=16384, r=8, p=1, dklen=KEY_LENGTH
        )
        return hmac.compare_digest(expected, actual)
    except (ValueError, TypeError):
        return False


def create_access_token(payload: dict[str, Any], settings: Settings | None = None) -> str:
    """Signs claims with the same secret and algorithm as NestJS JwtService."""
    resolved_settings = settings or get_settings()
    return jwt.encode(
        payload, resolved_settings.jwt_secret.get_secret_value(), algorithm="HS256"
    )


async def require_bearer(request: Request) -> dict[str, Any]:
    """Validates Bearer JWT and the project-specific loginTime window."""
    settings = get_resources(request).settings
    authorization = request.headers.get("authorization", "")
    token = authorization.removeprefix("Bearer ") if authorization.startswith("Bearer ") else ""
    return verify_bearer_token(token, settings)


def verify_bearer_token(
    token: str, settings: Settings, clock: Callable[[], float] = time.time
) -> dict[str, Any]:
    """Validates one JWT with an injectable clock and updates request identity."""
    if len(token) < 10:
        detail = "缺少必要的token信息:undefined" if not token else "无效的token信息"
        raise HTTPException(401, detail)
    try:
        payload = jwt.decode(
            token, settings.jwt_secret.get_secret_value(), algorithms=["HS256"]
        )
        login_time = float(payload.get("loginTime", 0))
        if login_time < clock() - settings.jwt_token_expired_time * 86_400:
            raise ValueError("登录已过期")
    except (jwt.PyJWTError, ValueError) as error:
        raise HTTPException(401, "无效或过期的token") from error
    context = get_request_context()
    context.user = payload
    return payload


async def require_system_admin(user: dict[str, Any] = Depends(require_bearer)) -> dict[str, Any]:
    """Restricts local user management to system administrators."""
    if not user.get("isSystemAdmin"):
        raise HTTPException(403, "需要系统管理员权限")
    return user


async def require_fixed_token(request: Request) -> dict[str, Any]:
    """Validates fixed-token state and module scope through Feishu Bitable."""
    token = request.headers.get("authorization", "")
    if not token:
        raise HTTPException(401, "Unauthorized")
    try:
        record = await get_resources(request).client_secret_table.get(token)
        fields = record.get("fields", {})
        if not fields.get("是否启用"):
            raise ValueError("认证密钥已失效")
        module = next((part for part in request.url.path.split("/") if part), "")
        if module not in (fields.get("使用范围") or []):
            raise ValueError("没有访问当前模块权限")
        supplier = str(fields.get("服务商", ""))
        context = get_request_context()
        context.user = {"supplierCode": supplier}
        context.tenant_code = {"A": "aplus", "C": "boat", "D": "yurex"}.get(
            supplier, get_resources(request).settings.default_tenant
        )
        return context.user
    except Exception as error:
        raise HTTPException(401, "无效的认证密钥") from error


async def require_composite_auth(request: Request) -> dict[str, Any]:
    """Selects JWT or fixed-token authentication from the Authorization syntax."""
    authorization = request.headers.get("authorization", "")
    if not authorization:
        raise HTTPException(401, "缺少认证信息")
    if authorization.startswith("Bearer "):
        return await require_bearer(request)
    return await require_fixed_token(request)
