from fastapi.testclient import TestClient

from python_api.main import app


def test_liveness_uses_standard_envelope() -> None:
    with TestClient(app) as client:
        response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {
        "code": 200,
        "body": {"status": "ok"},
        "message": "请求成功",
    }


def test_openapi_schema_is_not_response_wrapped() -> None:
    with TestClient(app) as client:
        response = client.get("/swagger/json")

    assert response.status_code == 200
    assert response.json()["openapi"]
    assert "/agent/chat" in response.json()["paths"]
