import os

import pytest
from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient

# Unit and contract tests must never bootstrap users into a developer database.
os.environ["PYTHON_API_ENV"] = "test"
os.environ["RAG_ADMIN_BOOTSTRAP_USERNAME"] = ""
os.environ["RAG_ADMIN_BOOTSTRAP_PASSWORD"] = ""


@pytest.fixture
async def client() -> AsyncClient:
    """Provides an in-process async client with the real application lifespan."""
    from python_api.main import create_app

    app = create_app()
    async with LifespanManager(app) as manager:
        async with AsyncClient(
            transport=ASGITransport(app=manager.app), base_url="http://test"
        ) as http_client:
            yield http_client
