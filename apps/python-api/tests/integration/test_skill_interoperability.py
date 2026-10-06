from __future__ import annotations

import os
from uuid import uuid4

import httpx
import pytest

NEST_API_URL = os.getenv("NEST_API_URL", "").rstrip("/")
PYTHON_API_URL = os.getenv("PYTHON_API_URL", "").rstrip("/")
OWNER_TOKEN = os.getenv("DIFFERENTIAL_BEARER_TOKEN", "")
OTHER_OWNER_TOKEN = os.getenv("DIFFERENTIAL_OTHER_BEARER_TOKEN", "")
ENABLED = os.getenv("SKILL_INTEROP_TEST_ENABLED", "").lower() == "true"

pytestmark = pytest.mark.skipif(
    not ENABLED
    or not NEST_API_URL
    or not PYTHON_API_URL
    or not OWNER_TOKEN
    or not OTHER_OWNER_TOKEN,
    reason=(
        "Set SKILL_INTEROP_TEST_ENABLED=true, both API URLs, and owner/other JWTs "
        "to run shared PostgreSQL Skill interoperability"
    ),
)


def _body(response: httpx.Response) -> object:
    """Extracts the shared success envelope body and asserts the request succeeded."""
    response.raise_for_status()
    payload = response.json()
    assert payload["code"] == 200, payload
    return payload["body"]


def test_backends_alternate_skill_crud_and_enforce_owner_isolation() -> None:
    """Exercises shared rows across both backends using isolated opt-in credentials."""
    owner_headers = {"Authorization": f"Bearer {OWNER_TOKEN}"}
    other_headers = {"Authorization": f"Bearer {OTHER_OWNER_TOKEN}"}
    name = f"interop-{uuid4().hex}"
    skill_id: int | None = None
    try:
        created = _body(
            httpx.post(
                f"{NEST_API_URL}/agent/skills/user",
                headers=owner_headers,
                json={"name": name, "instruction": "跨后端规则"},
                timeout=10,
            )
        )
        assert isinstance(created, dict)
        skill_id = int(created["id"])

        python_page = _body(
            httpx.post(
                f"{PYTHON_API_URL}/agent/skills/user/page",
                headers=owner_headers,
                json={"keyword": name},
                timeout=10,
            )
        )
        assert isinstance(python_page, dict)
        assert [skill["id"] for skill in python_page["list"]] == [skill_id]

        updated = _body(
            httpx.post(
                f"{PYTHON_API_URL}/agent/skills/user/{skill_id}",
                headers=owner_headers,
                json={"description": "updated-by-python"},
                timeout=10,
            )
        )
        assert isinstance(updated, dict)
        assert updated["description"] == "updated-by-python"

        denied = httpx.post(
            f"{PYTHON_API_URL}/agent/skills/user/{skill_id}",
            headers=other_headers,
            json={"isEnabled": False},
            timeout=10,
        ).json()
        assert denied["code"] == 404

        nest_page = _body(
            httpx.post(
                f"{NEST_API_URL}/agent/skills/user/page",
                headers=owner_headers,
                json={"keyword": name},
                timeout=10,
            )
        )
        assert isinstance(nest_page, dict)
        assert nest_page["list"][0]["description"] == "updated-by-python"

        _body(
            httpx.delete(
                f"{NEST_API_URL}/agent/skills/user/{skill_id}",
                headers=owner_headers,
                timeout=10,
            )
        )
        skill_id = None
    finally:
        if skill_id is not None:
            httpx.delete(
                f"{NEST_API_URL}/agent/skills/user/{skill_id}",
                headers=owner_headers,
                timeout=10,
            )
