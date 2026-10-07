from __future__ import annotations

from typing import Any

from langchain_core.tools import BaseTool, tool

from python_api.modules.agent.chat.tools.utilities import JsonSerializer
from python_api.modules.business.ds_order.schemas import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
    DsOrderLogPageRequest,
    DsOrderPageRequest,
)
from python_api.modules.business.ds_order.service import DsOrderService


def build_ds_order_tools(
    orders: DsOrderService, serialize: JsonSerializer
) -> list[BaseTool]:
    """Builds tenant-scoped DS order query and mutation tools."""

    @tool
    def list_ds_orders(
        page: int = 1, page_size: int = 10, status: str | None = None
    ) -> str:
        """Page tenant drop-shipping orders."""
        payload: dict[str, Any] = {"page": page, "pageSize": page_size}
        if status:
            payload["statusList"] = status
        return serialize(orders.page(DsOrderPageRequest.model_validate(payload)))

    @tool
    def get_ds_order(ds_order_no: str, query_available_quantity: int = 0) -> str:
        """Get one drop-shipping order."""
        request = DsOrderInfoRequest.model_validate(
            {
                "dsOrderNo": ds_order_no,
                "queryAvailableQuantity": query_available_quantity,
            }
        )
        return serialize(orders.info(request))

    @tool
    def list_ds_order_logs(
        ds_order_no: str, page: int = 1, page_size: int = 10
    ) -> str:
        """Page operation logs for one drop-shipping order."""
        request = DsOrderLogPageRequest.model_validate(
            {"dsOrderNo": ds_order_no, "page": page, "pageSize": page_size}
        )
        return serialize(orders.log_page(request))

    @tool
    def audit_ds_order(
        ds_order_no: str, passed: int, message: str | None = None
    ) -> str:
        """Approve or reject a drop-shipping order audit."""
        request = DsOrderAuditRequest.model_validate(
            {"dsOrderNo": ds_order_no, "passed": passed, "msg": message}
        )
        return serialize(orders.audit(request))

    @tool
    def cancel_ds_order(ds_order_no: str, cancel_message: str) -> str:
        """Submit cancellation for a drop-shipping order."""
        request = DsOrderCancelRequest.model_validate(
            {"dsOrderNo": ds_order_no, "cancelMsg": cancel_message}
        )
        return serialize(orders.cancel(request))

    return [
        list_ds_orders,
        get_ds_order,
        list_ds_order_logs,
        audit_ds_order,
        cancel_ds_order,
    ]
