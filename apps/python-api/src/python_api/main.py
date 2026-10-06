from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from python_api.config import get_settings
from python_api.errors import install_exception_handlers
from python_api.middleware import (
    RequestLoggingMiddleware,
    ResponseEnvelopeMiddleware,
    TenantMiddleware,
)
from python_api.redis_service import redis_client
from python_api.routes.agent_chat import router as agent_chat_router
from python_api.routes.agent_knowledge import router as agent_knowledge_router
from python_api.routes.auth import router as auth_router
from python_api.routes.ds_order import router as ds_order_router
from python_api.routes.health import router as health_router
from python_api.routes.rag_admin import router as rag_admin_router
from python_api.routes.rag_chat import router as rag_chat_router
from python_api.services.auth import bootstrap_admin


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Initializes and closes process-wide integrations."""
    await bootstrap_admin()
    yield
    await redis_client.aclose()


def create_app() -> FastAPI:
    """Builds the production application with NestJS-compatible middleware."""
    settings = get_settings()
    production = settings.node_env in {"production", "prod"}
    app = FastAPI(
        title="Aplus Frontend Python",
        description="FastAPI parity implementation for Aplus Frontend Node",
        version="1.0",
        docs_url=None if production else "/swagger",
        openapi_url=None if production else "/swagger/json",
        lifespan=lifespan,
    )
    app.add_middleware(ResponseEnvelopeMiddleware)
    app.add_middleware(TenantMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    install_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(rag_admin_router)
    app.include_router(agent_knowledge_router)
    app.include_router(agent_chat_router)
    app.include_router(ds_order_router)
    app.include_router(rag_chat_router)
    if settings.public_dir.exists():
        app.mount("/public", StaticFiles(directory=settings.public_dir), name="public")
    return app


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
app = create_app()
