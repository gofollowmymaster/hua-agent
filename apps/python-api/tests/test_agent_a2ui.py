import json

import pytest
from fastapi import HTTPException

from python_api.modules.agent.chat.a2ui import apply_order_action, compile_tool_result
from python_api.modules.business.ds_order.service import DsOrderService


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


def test_reject_and_cancel_require_a_reason() -> None:
    service = DsOrderService()
    with pytest.raises(HTTPException, match="必须填写原因"):
        apply_order_action({"dsOrderNo": "DS-001"}, "reject", None, service)
    with pytest.raises(HTTPException, match="必须填写原因"):
        apply_order_action({"dsOrderNo": "DS-001"}, "cancel", "", service)
