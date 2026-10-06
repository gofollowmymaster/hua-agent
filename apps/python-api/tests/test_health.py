from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient

from python_api.core.config import get_settings
from python_api.main import create_app


async def test_liveness_uses_standard_envelope(client: AsyncClient) -> None:
    response = await client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {
        "code": 200,
        "body": {"status": "ok"},
        "message": "请求成功",
    }


async def test_openapi_schema_is_not_response_wrapped(client: AsyncClient) -> None:
    response = await client.get("/swagger/json")

    assert response.status_code == 200
    assert response.json()["openapi"]
    assert "/agent/chat" in response.json()["paths"]


async def test_validation_error_keeps_business_envelope(client: AsyncClient) -> None:
    response = await client.post("/auth/login", json={})

    assert response.status_code == 200
    assert response.json()["code"] == 400
    assert response.json()["path"] == "/auth/login"
    assert response.json()["message"]


async def test_protected_route_keeps_auth_envelope(client: AsyncClient) -> None:
    response = await client.post("/agent/knowledge/ingest", json={"force": False})

    assert response.status_code == 200
    assert response.json() == {
        "code": 401,
        "message": "缺少必要的token信息:undefined",
        "path": "/agent/knowledge/ingest",
    }


async def test_create_app_settings_override_controls_request_limit() -> None:
    """Proves app-scoped settings reach middleware instead of the global cache."""
    settings = get_settings().model_copy(update={"python_api_max_request_size_bytes": 1})
    app = create_app(settings)
    async with LifespanManager(app) as manager:
        async with AsyncClient(
            transport=ASGITransport(app=manager.app), base_url="http://test"
        ) as client:
            response = await client.post("/auth/login", content=b"{}")

    assert response.status_code == 413
    assert response.json()["message"] == "Request body too large"
