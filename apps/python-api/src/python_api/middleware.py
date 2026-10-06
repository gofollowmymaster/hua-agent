from __future__ import annotations

import json
import logging
import time
from collections.abc import Awaitable, Callable
from typing import Any, cast

import jwt
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from python_api.config import get_settings
from python_api.context import RequestContext, reset_request_context, set_request_context

logger = logging.getLogger("python_api.http")
TENANT_CODES = {"A": "aplus", "C": "boat", "D": "yurex"}


class TenantMiddleware(BaseHTTPMiddleware):
    """Builds the same tenant context precedence used by NestJS middleware."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        settings = get_settings()
        user: dict[str, object] = {}
        supplier = request.headers.get("supplier")
        authorization = request.headers.get("authorization", "")
        if supplier:
            user = {"supplierCode": supplier}
        elif authorization.startswith("Bearer "):
            try:
                user = jwt.decode(
                    authorization.removeprefix("Bearer "),
                    options={"verify_signature": False},
                    algorithms=["HS256"],
                )
            except jwt.PyJWTError:
                user = {}
        elif authorization:
            # Full fixed-token verification is performed by the route dependency.
            user = {"fixedToken": authorization}

        supplier_code = str(user.get("supplierCode", ""))
        tenant = TENANT_CODES.get(
            supplier_code,
            supplier_code if supplier_code in TENANT_CODES.values() else settings.default_tenant,
        )
        token = set_request_context(RequestContext(tenant_code=tenant, user=user, request=request))
        try:
            return await call_next(request)
        finally:
            reset_request_context(token)


class ResponseEnvelopeMiddleware(BaseHTTPMiddleware):
    """Wraps successful JSON results while leaving streams and files untouched."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        if (
            response.status_code < 300
            and request.url.path != "/swagger/json"
            and response.headers.get("x-skip-transform") != "1"
            and response.headers.get("content-type", "").startswith("application/json")
        ):
            body_iterator = cast(Any, response).body_iterator
            body = b"".join([chunk async for chunk in body_iterator])
            data = json.loads(body or b"null")
            if not (isinstance(data, dict) and data.get("code") and data.get("message")):
                data = {"code": 200, "body": data, "message": "请求成功"}
            headers = dict(response.headers)
            headers.pop("content-length", None)
            from fastapi.responses import JSONResponse

            return JSONResponse(data, status_code=response.status_code, headers=headers)
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs request metadata without credentials or body contents."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        started = time.perf_counter()
        response = await call_next(request)
        logger.info(
            "request_complete method=%s path=%s status=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            response.status_code,
            (time.perf_counter() - started) * 1000,
        )
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects requests whose declared body exceeds the configured service limit."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                too_large = int(content_length) > get_settings().python_api_max_request_size_bytes
            except ValueError:
                too_large = False
            if too_large:
                return JSONResponse(
                    status_code=413,
                    content={
                        "code": 413,
                        "message": "Request body too large",
                        "path": request.url.path,
                    },
                )
        return await call_next(request)
