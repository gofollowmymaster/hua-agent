from __future__ import annotations

import logging
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from python_api.core.config import Settings, get_settings
from python_api.core.errors import install_exception_handlers
from python_api.core.middleware import (
    RequestLoggingMiddleware,
    RequestSizeLimitMiddleware,
    ResponseEnvelopeMiddleware,
    TenantMiddleware,
)
from python_api.core.resources import AppResources, create_app_resources
from python_api.modules.agent.chat.router import router as agent_chat_router
from python_api.modules.agent.knowledge.router import router as agent_knowledge_router
from python_api.modules.agent.skills.router import router as agent_skill_router
from python_api.modules.auth.session.router import router as auth_session_router
from python_api.modules.auth.users.router import router as auth_users_router
from python_api.modules.auth.users.service import bootstrap_admin
from python_api.modules.ds_order.router import router as ds_order_router
from python_api.modules.health.checks.router import router as health_router
from python_api.modules.rag.admin.router import router as rag_admin_router
from python_api.modules.rag.chat.router import router as rag_chat_router


def create_app(
    settings: Settings | None = None,
    resource_factory: Callable[[Settings], AppResources] = create_app_resources,
) -> FastAPI:
    """Builds the production application with NestJS-compatible middleware."""
    resolved_settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        """Creates and closes resources owned by this application instance."""
        resources = resource_factory(resolved_settings)
        application.state.resources = resources
        await bootstrap_admin(resolved_settings, resources.session_factory)
        try:
            yield
        finally:
            await resources.close()

    app = FastAPI(
        title="Aplus Frontend Python",
        description="FastAPI parity implementation for Aplus Frontend Node",
        version="1.0",
        docs_url="/swagger" if resolved_settings.docs_enabled else None,
        openapi_url="/swagger/json" if resolved_settings.docs_enabled else None,
        lifespan=lifespan,
    )
    app.add_middleware(ResponseEnvelopeMiddleware)
    app.add_middleware(TenantMiddleware, settings=resolved_settings)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware, settings=resolved_settings)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origin_list,
        allow_credentials=resolved_settings.cors_allow_credentials,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    install_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(auth_session_router)
    app.include_router(auth_users_router)
    app.include_router(rag_admin_router)
    app.include_router(agent_knowledge_router)
    app.include_router(agent_chat_router)
    app.include_router(agent_skill_router)
    app.include_router(ds_order_router)
    app.include_router(rag_chat_router)
    if resolved_settings.public_dir.exists():
        app.mount(
            "/public", StaticFiles(directory=resolved_settings.public_dir), name="public"
        )
    return app


logging.basicConfig(
    level=getattr(logging, get_settings().python_api_log_level),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
app = create_app()
