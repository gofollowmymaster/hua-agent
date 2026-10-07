from __future__ import annotations

import json
from typing import Any, cast
from unittest.mock import AsyncMock

import pytest

from python_api.modules.agent.chat.tools import (
    build_ds_order_tools,
    build_knowledge_tools,
    build_utility_tools,
)
from python_api.modules.agent.knowledge.service import AgentKnowledgeService
from python_api.modules.business.ds_order.schemas import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
    DsOrderLogPageRequest,
    DsOrderPageRequest,
)
from python_api.modules.business.ds_order.service import DsOrderService


def _serialize(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), default=str)


class FakeKnowledgeService:
    """Captures knowledge requests and returns deterministic provider-shaped data."""

    def __init__(self) -> None:
        self.search_request: Any = None
        self.document_id: int | None = None

    async def resolve_search_category_for_tool(self, category: str | None) -> str | None:
        """Mimics exact tenant-category resolution at the tool boundary."""
        normalized = (category or "").strip()
        if not normalized or normalized.lower() in {"null", "none", "undefined", "nil"}:
            return None
        return normalized if normalized == "流程" else None

    async def search(self, request: Any) -> list[dict[str, Any]]:
        """Returns one oversized hit so projection and truncation can be verified."""
        self.search_request = request
        return [
            {
                "documentId": 7,
                "category": "流程",
                "fileName": "退款.md",
                "sourcePath": "/退款.md",
                "remoteUrl": "https://example.invalid/7",
                "breadcrumb": ["业务", "退款"],
                "score": 0.9,
                "content": "x" * 1201,
                "internal": "hidden",
            }
        ]

    async def get_document_for_tool(self, document_id: int) -> dict[str, Any]:
        """Returns a complete document with one internal field that tools must not expose."""
        self.document_id = document_id
        return {
            "id": document_id,
            "fileName": "退款.md",
            "content": "完整正文" * 500,
            "internal": "hidden",
        }


class FakeDsOrderService:
    """Captures validated DS order requests passed by the Agent tools."""

    def __init__(self) -> None:
        self.requests: list[Any] = []

    def page(self, request: DsOrderPageRequest) -> dict[str, Any]:
        """Records a page request."""
        self.requests.append(request)
        return {"operation": "page"}

    def info(self, request: DsOrderInfoRequest) -> dict[str, Any]:
        """Records an info request."""
        self.requests.append(request)
        return {"operation": "info"}

    def log_page(self, request: DsOrderLogPageRequest) -> dict[str, Any]:
        """Records a log page request."""
        self.requests.append(request)
        return {"operation": "logs"}

    def audit(self, request: DsOrderAuditRequest) -> dict[str, Any]:
        """Records an audit request."""
        self.requests.append(request)
        return {"operation": "audit"}

    def cancel(self, request: DsOrderCancelRequest) -> dict[str, Any]:
        """Records a cancellation request."""
        self.requests.append(request)
        return {"operation": "cancel"}


@pytest.mark.asyncio
async def test_knowledge_tools_project_and_truncate_service_results() -> None:
    service = FakeKnowledgeService()
    search, get_document = build_knowledge_tools(
        cast(AgentKnowledgeService, service), _serialize
    )

    search_result = json.loads(
        await search.ainvoke({"query": "退款", "category": "流程", "top_k": 3})
    )
    document_result = json.loads(await get_document.ainvoke({"document_id": "7"}))

    assert service.search_request.query == "退款"
    assert service.search_request.category == "流程"
    assert service.search_request.top_k == 3
    assert "never pass blanks" in search.args_schema.model_json_schema()["properties"][
        "category"
    ]["description"]
    assert len(search_result[0]["content"]) == 1200
    assert "internal" not in search_result[0]
    assert service.document_id == 7
    assert document_result["id"] == 7
    assert len(document_result["content"]) > 1200
    assert document_result["content"].endswith("完整正文")
    assert "internal" not in document_result


@pytest.mark.asyncio
@pytest.mark.parametrize("category", [None, "", "   ", "\nnull", "NONE", "无意义字符"])
async def test_search_knowledge_ignores_invalid_categories(category: str | None) -> None:
    service = FakeKnowledgeService()
    search, _ = build_knowledge_tools(cast(AgentKnowledgeService, service), _serialize)

    await search.ainvoke({"query": "广告配置 设置 方法", "category": category})

    assert service.search_request.category is None


@pytest.mark.asyncio
async def test_search_knowledge_trims_an_exact_known_category() -> None:
    service = FakeKnowledgeService()
    search, _ = build_knowledge_tools(cast(AgentKnowledgeService, service), _serialize)

    await search.ainvoke({"query": "退款", "category": "  流程\n"})

    assert service.search_request.category == "流程"


@pytest.mark.asyncio
async def test_tool_category_resolution_is_scoped_to_searchable_tenant_chunks() -> None:
    service = object.__new__(AgentKnowledgeService)
    service.tenant = "yurex"
    service.db = AsyncMock()
    service.db.scalar.return_value = "业务流程"

    result = await service.resolve_search_category_for_tool("  业务流程\n")

    statement = service.db.scalar.await_args.args[0]
    parameters = statement.compile().params
    assert result == "业务流程"
    assert parameters["tenant_code_1"] == "yurex"
    assert parameters["tenant_code_2"] == "yurex"
    assert parameters["category_1"] == "业务流程"


@pytest.mark.asyncio
async def test_tool_category_resolution_drops_unknown_category() -> None:
    service = object.__new__(AgentKnowledgeService)
    service.tenant = "yurex"
    service.db = AsyncMock()
    service.db.scalar.return_value = None

    result = await service.resolve_search_category_for_tool("其他租户分类")

    assert result is None


def test_utility_tools_use_injected_time_and_safe_calculator() -> None:
    get_current_time, calculate = build_utility_tools(lambda: "now", _serialize)

    assert get_current_time.invoke({}) == "now"
    assert json.loads(calculate.invoke({"expression": "1+2*3"})) == {
        "expression": "1+2*3",
        "result": 7,
    }


def test_ds_order_tools_validate_and_forward_domain_requests() -> None:
    service = FakeDsOrderService()
    tools = build_ds_order_tools(cast(DsOrderService, service), _serialize)

    results = [
        tools[0].invoke({"page": 2, "page_size": 5, "status": "PROCESSING"}),
        tools[1].invoke({"ds_order_no": "DS-1", "query_available_quantity": 1}),
        tools[2].invoke({"ds_order_no": "DS-1", "page": 2, "page_size": 5}),
        tools[3].invoke({"ds_order_no": "DS-1", "passed": 0, "message": "资料不符"}),
        tools[4].invoke({"ds_order_no": "DS-1", "cancel_message": "客户要求"}),
    ]

    assert [json.loads(result)["operation"] for result in results] == [
        "page",
        "info",
        "logs",
        "audit",
        "cancel",
    ]
    assert isinstance(service.requests[0], DsOrderPageRequest)
    assert service.requests[0].status_list == "PROCESSING"
    assert isinstance(service.requests[1], DsOrderInfoRequest)
    assert service.requests[1].query_available_quantity == 1
    assert isinstance(service.requests[2], DsOrderLogPageRequest)
    assert isinstance(service.requests[3], DsOrderAuditRequest)
    assert service.requests[3].msg == "资料不符"
    assert isinstance(service.requests[4], DsOrderCancelRequest)
    assert service.requests[4].cancel_msg == "客户要求"
