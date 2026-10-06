from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from python_api.config import ConfigurationError


class AppError(Exception):
    """Represents project errors whose HTTP status must not be rewritten."""

    def __init__(self, message: str, code: int = 500, *, report: bool = True) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.report = report


class NotReportError(AppError):
    """Matches the NestJS NotReportException response and alert behavior."""

    def __init__(self, message: str = "", code: int = 200) -> None:
        super().__init__(f"忽略:{message}", code, report=False)


def _path(request: Request) -> str:
    """Builds the request path used in compatible error payloads."""
    query = request.url.query
    return request.url.path + (f"?{query}" if query else "")


def install_exception_handlers(app: FastAPI) -> None:
    """Installs handlers that preserve the NestJS filter wire format."""

    @app.exception_handler(RequestValidationError)
    async def validation_handler(
        request: Request, exception: RequestValidationError
    ) -> JSONResponse:
        """Converts Pydantic validation failures into the shared business envelope."""
        messages = []
        for error in exception.errors():
            location = ".".join(str(part) for part in error["loc"] if part != "body")
            messages.append(f"{location} {error['msg']}".strip())
        return JSONResponse(
            status_code=200,
            content={"code": 400, "message": messages, "path": _path(request)},
        )

    @app.exception_handler(HTTPException)
    async def http_handler(request: Request, exception: HTTPException) -> JSONResponse:
        """Preserves FastAPI HTTP error codes inside the compatible JSON payload."""
        return JSONResponse(
            status_code=200,
            content={
                "code": exception.status_code,
                "message": exception.detail,
                "path": _path(request),
            },
        )

    @app.exception_handler(AppError)
    async def app_handler(request: Request, exception: AppError) -> JSONResponse:
        """Returns project errors without rewriting their status or message."""
        return JSONResponse(
            status_code=exception.code,
            content={"code": exception.code, "message": exception.message, "path": _path(request)},
        )

    @app.exception_handler(ConfigurationError)
    async def configuration_handler(
        request: Request, exception: ConfigurationError
    ) -> JSONResponse:
        """Reports unavailable runtime configuration without exposing secret values."""
        return JSONResponse(
            status_code=503,
            content={"code": 503, "message": str(exception), "path": _path(request)},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_handler(request: Request, exception: IntegrityError) -> JSONResponse:
        """Maps database uniqueness failures to a stable conflict response."""
        return JSONResponse(
            status_code=409,
            content={
                "code": 409,
                "message": "Unique constraint violation",
                "error": str(exception.orig),
            },
        )

    @app.exception_handler(Exception)
    async def fallback_handler(request: Request, exception: Exception) -> JSONResponse:
        """Converts otherwise unhandled failures into the generic error envelope."""
        return JSONResponse(
            status_code=500,
            content={
                "code": 500,
                "message": str(exception) or "Internal Server Error",
                "path": _path(request),
            },
        )
