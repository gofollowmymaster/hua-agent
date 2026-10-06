import os
import re
from typing import Any

import httpx
import pytest
from test_contract_manifest import EXPECTED_ROUTES

NEST_API_URL = os.getenv("NEST_API_URL", "").rstrip("/")
PYTHON_API_URL = os.getenv("PYTHON_API_URL", "").rstrip("/")


def _concrete_path(path: str) -> str:
    return re.sub(r"\{[^}]+\}", "1", path)


def _request(base_url: str, method: str, path: str) -> httpx.Response:
    kwargs: dict[str, Any] = {"timeout": 10}
    if method in {"POST", "PUT", "PATCH"}:
        kwargs["json"] = {}
    return httpx.request(method, base_url + _concrete_path(path), **kwargs)


@pytest.mark.skipif(
    not NEST_API_URL or not PYTHON_API_URL,
    reason="Set NEST_API_URL and PYTHON_API_URL to run dual-stack differential checks",
)
@pytest.mark.parametrize(("method", "path"), sorted(EXPECTED_ROUTES))
def test_unauthenticated_error_contract_matches_nestjs(method: str, path: str) -> None:
    """Compares every route's non-mutating auth or empty-DTO boundary."""
    nest = _request(NEST_API_URL, method, path)
    python = _request(PYTHON_API_URL, method, path)

    assert python.status_code == nest.status_code
    assert python.headers.get("content-type", "").split(";", 1)[0] == nest.headers.get(
        "content-type", ""
    ).split(";", 1)[0]
    if "application/json" in nest.headers.get("content-type", ""):
        assert python.json() == nest.json()
