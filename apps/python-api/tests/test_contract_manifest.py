from python_api.main import app

EXPECTED_ROUTES = {
    ("POST", "/auth/login"),
    ("POST", "/auth/users/page"),
    ("POST", "/auth/users"),
    ("POST", "/auth/users/{user_id}"),
    ("POST", "/auth/users/{user_id}/password"),
    ("POST", "/ai/rag/admin/documents/page"),
    ("GET", "/ai/rag/admin/documents/{document_id}"),
    ("POST", "/ai/rag/admin/documents/upload"),
    ("DELETE", "/ai/rag/admin/documents/{document_id}"),
    ("POST", "/ai/rag/admin/documents/{document_id}/metadata"),
    ("POST", "/ai/rag/admin/documents/{document_id}/chunks/page"),
    ("GET", "/ai/rag/admin/documents/{document_id}/preview"),
    ("POST", "/ai/rag/admin/ingest"),
    ("POST", "/ai/rag/admin/sessions/page"),
    ("GET", "/ai/rag/admin/sessions/{session_id}/messages"),
    ("POST", "/agent/knowledge/ingest"),
    ("POST", "/agent/knowledge/search"),
    ("GET", "/agent/knowledge/documents"),
    ("GET", "/agent/knowledge/documents/{document_id}"),
    ("POST", "/agent/knowledge/documents/{document_id}/chunks/page"),
    ("GET", "/agent/knowledge/documents/{document_id}/preview"),
    ("DELETE", "/agent/knowledge/documents/{document_id}"),
    ("POST", "/agent/chat"),
    ("POST", "/agent/chat/sessions/page"),
    ("GET", "/agent/chat/sessions/{session_id}/messages"),
    ("POST", "/oms/admin/dsOrder/page"),
    ("POST", "/oms/admin/dsOrder/info"),
    ("POST", "/oms/admin/dsOrder/logPage"),
    ("POST", "/oms/admin/dsOrder/audit"),
    ("POST", "/oms/admin/dsOrder/cancel"),
    ("POST", "/ai/rag/chat"),
}


def test_all_nestjs_contract_routes_are_exposed() -> None:
    """Locks the 31-method NestJS compatibility surface."""
    paths = app.openapi()["paths"]
    actual = {
        (method.upper(), path)
        for path, operations in paths.items()
        for method in operations
        if method in {"get", "post", "put", "patch", "delete"} and not path.startswith("/health/")
    }
    assert actual == EXPECTED_ROUTES
    assert len(actual) == 31
