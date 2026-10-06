from __future__ import annotations

import os
import uuid

import pytest
from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from python_api.core.config import get_settings
from python_api.core.context import RequestContext, reset_request_context, set_request_context
from python_api.core.database import create_database_engine
from python_api.integrations.redis import RedisService, create_redis_client
from python_api.main import create_app

pytestmark = pytest.mark.integration

if os.getenv("PYTHON_API_INTEGRATION") != "1":
    pytest.skip("integration environment is not enabled", allow_module_level=True)


async def test_postgres_extensions_vector_and_zhparser() -> None:
    engine = create_database_engine(get_settings())
    try:
        async with engine.connect() as connection:
            extensions = set(
                (await connection.execute(text("SELECT extname FROM pg_extension"))).scalars()
            )
            distance = await connection.scalar(
                text("SELECT '[1,0,0]'::vector <=> '[0,1,0]'::vector")
            )
            lexemes = await connection.scalar(
                text("SELECT to_tsvector('zhparser', '中文知识检索')::text")
            )
        assert {"vector", "zhparser"}.issubset(extensions)
        assert float(distance) == pytest.approx(1.0)
        assert lexemes
    finally:
        await engine.dispose()


async def test_application_lifespan_liveness_and_readiness() -> None:
    app = create_app(get_settings())
    async with LifespanManager(app) as manager:
        async with AsyncClient(
            transport=ASGITransport(app=manager.app), base_url="http://test"
        ) as client:
            live = await client.get("/health/live")
            ready = await client.get("/health/ready")

    assert live.status_code == 200
    assert live.json()["body"] == {"status": "ok"}
    assert ready.status_code == 200
    assert ready.json()["body"] == {
        "status": "ok",
        "configuration": True,
        "database": True,
        "redis": True,
    }


async def test_tenant_rows_commit_rollback_and_message_order() -> None:
    engine = create_database_engine(get_settings())
    suffix = uuid.uuid4().hex
    committed = f"integration-committed-{suffix}"
    rolled_back = f"integration-rolled-back-{suffix}"
    try:
        async with engine.begin() as connection:
            await connection.execute(
                text(
                    "INSERT INTO rag_admin_users "
                    "(tenant_code,supplier_code,username,display_name,password_hash) "
                    "VALUES ('aplus','A',:username,'test','hash')"
                ),
                {"username": committed},
            )
            session_id = await connection.scalar(
                text(
                    "INSERT INTO aplus_rag_sessions "
                    "(tenant_code,channel,session_key,metadata) "
                    "VALUES ('aplus','integration',:key,'{}'::jsonb) RETURNING id"
                ),
                {"key": suffix},
            )
            await connection.execute(
                text(
                    "INSERT INTO aplus_rag_messages "
                    "(tenant_code,session_id,role,content,metadata,created_at) VALUES "
                    "('aplus',:session_id,'user','first','{}'::jsonb,CURRENT_TIMESTAMP),"
                    "('aplus',:session_id,'assistant','second','{}'::jsonb,CURRENT_TIMESTAMP + INTERVAL '1 second')"
                ),
                {"session_id": session_id},
            )
        async with engine.connect() as connection:
            transaction = await connection.begin()
            await connection.execute(
                text(
                    "INSERT INTO rag_admin_users "
                    "(tenant_code,supplier_code,username,display_name,password_hash) "
                    "VALUES ('boat','C',:username,'test','hash')"
                ),
                {"username": rolled_back},
            )
            await transaction.rollback()
            rows = (
                await connection.execute(
                    text(
                        "SELECT tenant_code,username FROM rag_admin_users "
                        "WHERE username IN (:committed,:rolled_back) ORDER BY username"
                    ),
                    {"committed": committed, "rolled_back": rolled_back},
                )
            ).all()
            messages = (
                await connection.execute(
                    text(
                        "SELECT content FROM aplus_rag_messages "
                        "WHERE tenant_code='aplus' AND session_id=:session_id ORDER BY created_at"
                    ),
                    {"session_id": session_id},
                )
            ).scalars().all()
        assert rows == [("aplus", committed)]
        assert messages == ["first", "second"]
    finally:
        async with engine.begin() as connection:
            await connection.execute(
                text("DELETE FROM aplus_rag_sessions WHERE session_key=:key"), {"key": suffix}
            )
            await connection.execute(
                text("DELETE FROM rag_admin_users WHERE username IN (:one,:two)"),
                {"one": committed, "two": rolled_back},
            )
        await engine.dispose()


async def test_redis_ttl_limiter_idempotency_and_tenant_keys() -> None:
    client = create_redis_client(get_settings())
    redis = RedisService(client)
    namespace = uuid.uuid4().hex
    token = set_request_context(RequestContext(tenant_code="aplus"))
    calls = 0

    async def handler() -> str:
        nonlocal calls
        calls += 1
        return "ok"

    try:
        aplus_key = redis.build_key("frontend-node:{tenant}:integration:{key}", key=namespace)
        reset_request_context(token)
        token = set_request_context(RequestContext(tenant_code="boat"))
        boat_key = redis.build_key("frontend-node:{tenant}:integration:{key}", key=namespace)
        assert aplus_key != boat_key
        assert await redis.limiter(f"integration:{namespace}", 1, 30) is False
        assert await redis.limiter(f"integration:{namespace}", 1, 30) is True
        assert await redis.idempotent(f"integration:{namespace}", handler, 30) == "ok"
        assert await redis.idempotent(f"integration:{namespace}", handler, 30) is None
        assert calls == 1
        assert await client.ttl(f"frontend-node:idempotent:integration:{namespace}") > 0
    finally:
        reset_request_context(token)
        await client.delete(
            f"frontend-node:limiter:integration:{namespace}",
            f"frontend-node:idempotent:integration:{namespace}",
        )
        await client.aclose()
