import json
from typing import Any, cast

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.session import ResolvedSession
from python_api.modules.agent.chat.a2ui import (
    apply_order_action,
    compile_tool_result,
    final_card_intro,
)
from python_api.modules.agent.chat.a2ui_service import AgentA2uiActionService
from python_api.modules.agent.chat.schemas import AgentA2uiActionRequest
from python_api.modules.business.ds_order.service import DsOrderService


class FakeActionMemory:
    """Captures owner-bound surface lookup and persisted command updates."""

    def __init__(self, source: dict[str, Any] | None) -> None:
        self.source = source
        self.participant_id: str | None = None
        self.appended: dict[str, Any] | None = None

    def resolve(
        self, conversation_id: str, participant_id: str | None, message_id: str | None
    ) -> ResolvedSession:
        self.participant_id = participant_id
        return ResolvedSession(
            "aplus", "agent-web", "key", conversation_id, "agent-chat", participant_id, message_id
        )

    async def find_a2ui_surface(
        self, _session: ResolvedSession, _surface_id: str
    ) -> dict[str, Any] | None:
        return self.source

    async def append_a2ui_command(
        self, _session: ResolvedSession, surface_id: str, command: dict[str, Any]
    ) -> bool:
        self.appended = {"surfaceId": surface_id, "command": command}
        return True


class FakeActionOrders:
    """Applies one deterministic audit transition for action-service tests."""

    def __init__(self, status: str) -> None:
        self.status = status
        self.audit_calls = 0

    def info(self, _request: Any) -> dict[str, Any]:
        return {"dsOrderNo": "DS-001", "status": self.status}

    def audit(self, _request: Any) -> dict[str, Any]:
        self.audit_calls += 1
        self.status = "PROCESSING"
        return {"dsOrderNo": "DS-001", "status": self.status}

    def cancel(self, _request: Any) -> dict[str, Any]:
        raise AssertionError("cancel should not be called")


def action_source(status: str = "PENDING_AUDIT") -> dict[str, Any]:
    return {
        "surfaceId": "order-1",
        "commands": [
            {
                "version": "v0.9",
                "updateDataModel": {
                    "surfaceId": "order-1",
                    "path": "/order",
                    "value": {"dsOrderNo": "DS-001", "status": status},
                },
            }
        ],
    }


def test_order_tool_result_compiles_only_local_v09_surface() -> None:
    card = compile_tool_result(
        "get_ds_order",
        json.dumps({"dsOrderNo": "DS-001", "status": "PENDING_AUDIT"}),
    )

    assert card is not None
    assert card["surfaceId"].startswith("order-")
    assert [next(iter(command)) for command in card["commands"]] == [
        "version",
        "version",
        "version",
    ]
    assert card["commands"][0]["createSurface"]["catalogId"].startswith("local://")
    assert card["commands"][1]["updateComponents"]["components"][0]["component"] == "OrderDetail"


def test_unknown_or_invalid_tool_result_does_not_create_a_card() -> None:
    assert compile_tool_result("search_knowledge", "[]") is None
    assert compile_tool_result("get_ds_order", "not-json") is None
    assert (
        compile_tool_result(
            "audit_ds_order",
            json.dumps({"dsOrderNo": "DS-001", "status": "PROCESSING"}),
        )
        is None
    )


@pytest.mark.parametrize(
    ("status", "expected"),
    [
        ("PENDING_AUDIT", "请核对订单信息并完成审核。"),
        ("PROCESSING", "请核对订单信息，如需取消请填写原因。"),
        ("IN_DISTRIBUTION", "请核对订单信息，如需取消请填写原因。"),
        ("CANCEL_PENDING_AUDIT", "请核对取消申请并完成审核。"),
        ("COMPLETED", "请查看订单详情。"),
    ],
)
def test_final_card_intro_follows_order_status(status: str, expected: str) -> None:
    card = compile_tool_result(
        "get_ds_order", json.dumps({"dsOrderNo": "DS-001", "status": status})
    )

    assert card is not None
    assert final_card_intro([card]) == expected


def test_final_card_intro_handles_lists_and_mixed_surfaces() -> None:
    order_list = compile_tool_result("list_ds_orders", json.dumps({"records": []}))
    detail = compile_tool_result(
        "get_ds_order", json.dumps({"dsOrderNo": "DS-001", "status": "COMPLETED"})
    )

    assert order_list is not None
    assert detail is not None
    assert final_card_intro([order_list]) == "已为你整理订单列表。"
    assert final_card_intro([order_list, detail]) == "已为你整理相关订单，请在下方查看或处理。"


def test_reject_and_cancel_require_a_reason() -> None:
    service = DsOrderService()
    with pytest.raises(HTTPException, match="必须填写原因"):
        apply_order_action({"dsOrderNo": "DS-001"}, "reject", None, service)
    with pytest.raises(HTTPException, match="必须填写原因"):
        apply_order_action({"dsOrderNo": "DS-001"}, "cancel", "", service)


@pytest.mark.asyncio
async def test_action_service_binds_owner_and_persists_fresh_order_state() -> None:
    memory = FakeActionMemory(action_source())
    orders = FakeActionOrders("PENDING_AUDIT")
    service = AgentA2uiActionService(cast(AsyncSession, None))
    service.memory = cast(Any, memory)
    service.orders = cast(DsOrderService, orders)

    result = await service.execute(
        AgentA2uiActionRequest.model_validate(
            {
                "conversationId": "conversation-1",
                "surfaceId": "order-1",
                "action": "approve",
            }
        ),
        "user-7",
    )

    assert memory.participant_id == "user-7"
    assert orders.audit_calls == 1
    assert result["commands"][0]["updateDataModel"]["value"]["status"] == "PROCESSING"
    assert memory.appended == {
        "surfaceId": "order-1",
        "command": result["commands"][0],
    }


@pytest.mark.asyncio
async def test_action_service_rejects_unknown_surface_and_stale_state() -> None:
    request = AgentA2uiActionRequest.model_validate(
        {
            "conversationId": "conversation-1",
            "surfaceId": "order-1",
            "action": "approve",
        }
    )
    missing = AgentA2uiActionService(cast(AsyncSession, None))
    missing.memory = cast(Any, FakeActionMemory(None))
    missing.orders = cast(DsOrderService, FakeActionOrders("PENDING_AUDIT"))

    with pytest.raises(HTTPException, match="未找到当前会话") as missing_error:
        await missing.execute(request, "user-7")
    assert missing_error.value.status_code == 404

    stale = AgentA2uiActionService(cast(AsyncSession, None))
    stale.memory = cast(Any, FakeActionMemory(action_source()))
    stale.orders = cast(DsOrderService, FakeActionOrders("COMPLETED"))

    with pytest.raises(HTTPException, match="订单状态已变化") as stale_error:
        await stale.execute(request, "user-7")
    assert stale_error.value.status_code == 409
