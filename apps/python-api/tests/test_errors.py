from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from python_api.core.errors import install_exception_handlers


async def test_unhandled_error_does_not_expose_internal_detail() -> None:
    app = FastAPI()
    install_exception_handlers(app)

    @app.get("/failure")
    async def failure() -> None:
        raise RuntimeError("postgresql://secret@database/private/path")

    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
    ) as client:
        response = await client.get("/failure")

    assert response.status_code == 500
    assert response.json() == {
        "code": 500,
        "message": "Internal Server Error",
        "path": "/failure",
    }
