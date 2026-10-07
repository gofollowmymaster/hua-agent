from __future__ import annotations

import json
from typing import Any, Literal
from uuid import uuid4

from fastapi import HTTPException

from python_api.modules.business.ds_order.schemas import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
)
from python_api.modules.business.ds_order.service import DsOrderService

CATALOG_ID = "local://aplus-agent-order-v0.9"
ActionName = Literal["approve", "reject", "cancel", "approve_cancel", "reject_cancel"]
MIXED_CARD_INTRO = "已为你整理相关订单，请在下方查看或处理。"


def compile_tool_result(name: str, result: str) -> dict[str, Any] | None:
    """Builds one restricted A2UI surface from a supported order tool result."""
    try:
        value = json.loads(result)
    except (TypeError, json.JSONDecodeError):
        return None
    surface_id = f"order-{uuid4()}"
    if (
        name == "list_ds_orders"
        and isinstance(value, dict)
        and isinstance(value.get("records"), list)
    ):
        return _surface(surface_id, "OrderList", "/orders", value["records"])
    if name == "get_ds_order" and isinstance(value, dict) and value.get("dsOrderNo"):
        return _surface(surface_id, "OrderDetail", "/order", value)
    return None


def final_card_intro(cards: list[dict[str, Any]]) -> str:
    """Selects deterministic concise copy for the final card section."""
    if len(cards) != 1:
        return MIXED_CARD_INTRO
    model = _data_model(cards[0])
    if not model:
        return MIXED_CARD_INTRO
    path, value = model
    if path == "/orders":
        return "已为你整理订单列表。"
    if path != "/order" or not isinstance(value, dict):
        return MIXED_CARD_INTRO
    status = value.get("status")
    if status == "PENDING_AUDIT":
        return "请核对订单信息并完成审核。"
    if status in {"PROCESSING", "IN_DISTRIBUTION"}:
        return "请核对订单信息，如需取消请填写原因。"
    if status == "CANCEL_PENDING_AUDIT":
        return "请核对取消申请并完成审核。"
    return "请查看订单详情。"


def apply_order_action(
    order: dict[str, Any], action: ActionName, reason: str | None, service: DsOrderService
) -> dict[str, Any]:
    """Revalidates an A2UI action against current order state and returns fresh detail."""
    order_no = str(order.get("dsOrderNo") or "")
    if not order_no:
        raise HTTPException(400, "卡片订单数据无效")
    if action in {"reject", "cancel", "reject_cancel"} and not (reason and reason.strip()):
        raise HTTPException(400, "该操作必须填写原因")
    current = service.info(DsOrderInfoRequest(ds_order_no=order_no, query_available_quantity=0))
    expected_statuses = {
        "approve": {"PENDING_AUDIT"},
        "reject": {"PENDING_AUDIT"},
        "cancel": {"PROCESSING", "IN_DISTRIBUTION"},
        "approve_cancel": {"CANCEL_PENDING_AUDIT"},
        "reject_cancel": {"CANCEL_PENDING_AUDIT"},
    }
    if current.get("status") not in expected_statuses[action]:
        raise HTTPException(409, "订单状态已变化，请刷新卡片后重试")
    if action == "approve":
        service.audit(DsOrderAuditRequest(ds_order_no=order_no, passed=1))
    elif action == "reject":
        service.audit(DsOrderAuditRequest(ds_order_no=order_no, passed=0, msg=reason))
    elif action == "cancel":
        service.cancel(DsOrderCancelRequest(ds_order_no=order_no, cancel_msg=reason or ""))
    elif action == "approve_cancel":
        service.audit(DsOrderAuditRequest(ds_order_no=order_no, passed=1))
    elif action == "reject_cancel":
        service.audit(DsOrderAuditRequest(ds_order_no=order_no, passed=0, msg=reason))
    else:
        raise HTTPException(400, "不支持的卡片操作")
    return service.info(DsOrderInfoRequest(ds_order_no=order_no, query_available_quantity=0))


def update_order_command(surface_id: str, order: dict[str, Any]) -> dict[str, Any]:
    """Builds the only post-action command accepted by the order-card surface."""
    return {
        "version": "v0.9",
        "updateDataModel": {"surfaceId": surface_id, "path": "/order", "value": order},
    }


def _surface(surface_id: str, component: str, path: str, value: Any) -> dict[str, Any]:
    return {
        "surfaceId": surface_id,
        "commands": [
            {
                "version": "v0.9",
                "createSurface": {"surfaceId": surface_id, "catalogId": CATALOG_ID},
            },
            {
                "version": "v0.9",
                "updateComponents": {
                    "surfaceId": surface_id,
                    "components": [{"id": "root", "component": component, "value": {"path": path}}],
                },
            },
            {
                "version": "v0.9",
                "updateDataModel": {"surfaceId": surface_id, "path": path, "value": value},
            },
        ],
    }


def _data_model(card: dict[str, Any]) -> tuple[str, Any] | None:
    for command in card.get("commands", []):
        update = command.get("updateDataModel") if isinstance(command, dict) else None
        if isinstance(update, dict) and isinstance(update.get("path"), str):
            return update["path"], update.get("value")
    return None
