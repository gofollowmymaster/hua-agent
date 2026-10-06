from __future__ import annotations

from contextvars import ContextVar, Token
from dataclasses import dataclass, field
from typing import Any

from starlette.requests import Request


@dataclass(slots=True)
class RequestContext:
    """Carries tenant and authenticated identity through one async request."""

    tenant_code: str = "aplus"
    user: dict[str, Any] = field(default_factory=dict)
    request: Request | None = None


_request_context: ContextVar[RequestContext | None] = ContextVar("request_context", default=None)


def get_request_context() -> RequestContext:
    """Returns the context attached by tenant middleware."""
    context = _request_context.get()
    return context if context is not None else RequestContext()


def set_request_context(context: RequestContext) -> Token[RequestContext | None]:
    """Installs a request context and returns its reset token."""
    return _request_context.set(context)


def reset_request_context(token: Token[RequestContext | None]) -> None:
    """Removes request state after the response has completed."""
    _request_context.reset(token)
