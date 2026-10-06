from __future__ import annotations

import copy
import time
from datetime import datetime
from typing import Any

from fastapi import HTTPException

from python_api.core.context import get_request_context
from python_api.schemas.ds_order import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
    DsOrderLogPageRequest,
    DsOrderPageRequest,
)

BASE_CREATED_AT = int(datetime.fromisoformat("2026-09-01T08:00:00+08:00").timestamp() * 1000)
SORTABLE = {"id", "dsOrderNo", "externalCode", "status", "salePlatform", "createdAt"}


class DsOrderService:
    """Provides the tenant-isolated in-memory OMS-compatible fixture."""

    _states: dict[str, dict[str, Any]] = {}

    def page(self, request: DsOrderPageRequest) -> dict[str, Any]:
        """Filters, sorts and pages current-tenant fixture orders."""
        orders = [item for item in self._state()["orders"] if self._matches(item, request)]
        sorters = [item for item in request.orders or [] if item.column in SORTABLE]
        orders.sort(key=lambda item: (-item["createdAt"], -item["id"]))
        for sorter in reversed(sorters):
            orders.sort(
                key=lambda item: str(item.get(sorter.column, "")), reverse=sorter.asc is False
            )
        start = (request.page - 1) * request.page_size
        return {
            "records": [
                self._page_item(item) for item in orders[start : start + request.page_size]
            ],
            "size": request.page_size,
            "current": request.page,
            "total": len(orders),
        }

    def info(self, request: DsOrderInfoRequest) -> dict[str, Any]:
        """Returns a copy of one fixture order."""
        result = copy.deepcopy(self._find(request.ds_order_no))
        result.pop("cancelPreviousStatus", None)
        if request.query_available_quantity != 1:
            for detail in result["details"]:
                detail.pop("availableQuantity", None)
        return result

    def log_page(self, request: DsOrderLogPageRequest) -> dict[str, Any]:
        """Returns reverse-chronological fixture logs."""
        self._find(request.ds_order_no)
        logs = sorted(
            self._state()["logs"].get(request.ds_order_no, []),
            key=lambda item: item["createdAt"],
            reverse=True,
        )
        start = (request.page - 1) * request.page_size
        return {
            "records": copy.deepcopy(logs[start : start + request.page_size]),
            "size": request.page_size,
            "current": request.page,
            "total": len(logs),
        }

    def audit(self, request: DsOrderAuditRequest) -> dict[str, Any]:
        """Transitions an auditable order and appends a log."""
        order = self._find(request.ds_order_no)
        before = order["status"]
        if before not in {"PENDING_AUDIT", "CANCEL_PENDING_AUDIT"}:
            raise HTTPException(400, f"订单 {request.ds_order_no} 当前状态不允许审核")
        if before == "PENDING_AUDIT":
            order["status"] = "PROCESSING" if request.passed == 1 else "REJECTED"
            order["tipType"] = None if request.passed == 1 else "SUBMIT_REJECTED"
            order["tipMsg"] = (
                None if request.passed == 1 else request.msg.strip() if request.msg else None
            )
        elif request.passed == 1:
            order["status"] = "CANCELLED"
            order["cancelTime"] = int(time.time() * 1000)
            order["tipType"] = "CANCELLED"
            order["tipMsg"] = order.get("cancelMsg")
            order.pop("cancelPreviousStatus", None)
        else:
            order["status"] = order.get("cancelPreviousStatus", "PROCESSING")
            order["tipType"] = "CANCEL_REJECTED"
            order["tipMsg"] = request.msg.strip() if request.msg else None
            order.pop("cancelPreviousStatus", None)
        self._append_log(
            order["dsOrderNo"],
            "AUDIT",
            f"审核{'通过' if request.passed == 1 else '驳回'}：{before} -> {order['status']}",
        )
        return self._mutation(order)

    def cancel(self, request: DsOrderCancelRequest) -> dict[str, Any]:
        """Submits cancellation for a processing or distributing order."""
        order = self._find(request.ds_order_no)
        if order["status"] not in {"PROCESSING", "IN_DISTRIBUTION"}:
            raise HTTPException(400, f"订单 {request.ds_order_no} 当前状态不允许取消")
        before = order["status"]
        order["cancelPreviousStatus"] = before
        order["status"] = "CANCEL_PENDING_AUDIT"
        order["cancelMsg"] = request.cancel_msg.strip()
        order.pop("tipType", None)
        order.pop("tipMsg", None)
        self._append_log(
            order["dsOrderNo"], "CANCEL", f"提交取消申请：{before} -> {order['status']}"
        )
        return self._mutation(order)

    def _state(self) -> dict[str, Any]:
        """Returns the isolated in-memory order state for the current tenant."""
        tenant = get_request_context().tenant_code
        return self._states.setdefault(tenant, self._fixture(tenant))

    def _find(self, number: str) -> dict[str, Any]:
        """Finds an order by number within the current tenant state."""
        order = next(
            (item for item in self._state()["orders"] if item["dsOrderNo"] == number), None
        )
        if not order:
            raise HTTPException(400, f"一件代发订单 {number} 不存在")
        return order

    def _matches(self, order: dict[str, Any], request: DsOrderPageRequest) -> bool:
        """Applies the supported order list filters to one fixture record."""
        mapping = [
            (request.id_list, "id"),
            (request.ds_order_no_list, "dsOrderNo"),
            (request.external_code_list, "externalCode"),
            (request.tenant_code_list, "tenantCode"),
            (request.sale_platform_list, "salePlatform"),
            (request.operations_manager_code_list, "operationsManagerCode"),
        ]
        if any(values and order.get(key) not in values for values, key in mapping):
            return False
        scalar = [
            (request.status_list, "status"),
            (request.transport_mode, "transportMode"),
            (request.main_responsible_person_flag, "mainResponsiblePersonFlag"),
            (request.carrier_type, "carrierType"),
        ]
        if any(value is not None and order.get(key) != value for value, key in scalar):
            return False
        if request.created_at_start and order["createdAt"] < request.created_at_start:
            return False
        if request.created_at_end and order["createdAt"] > request.created_at_end:
            return False
        if request.product_name_list and not any(
            any(
                name.lower() in detail.get("productName", "").lower()
                for name in request.product_name_list
            )
            for detail in order["details"]
        ):
            return False
        if (
            request.product_id_param
            and request.product_id_param.key
            and request.product_id_param.value
        ):
            keys = [key for key in request.product_id_param.key if key in {"asku", "asin", "msku"}]
            if not any(
                any(detail.get(key, "") in request.product_id_param.value for key in keys)
                for detail in order["details"]
            ):
                return False
        return True

    def _append_log(self, number: str, business_type: str, content: str) -> None:
        """Appends an audit entry using the current authenticated operator metadata."""
        user = get_request_context().user
        self._state()["logs"].setdefault(number, []).append(
            {
                "operator": user.get("username") or user.get("supplierName") or "Business Agent",
                "operatorEmail": user.get("loginId"),
                "bizType": business_type,
                "createdAt": int(time.time() * 1000),
                "content": content,
                "status": "SUCCESS",
            }
        )

    @staticmethod
    def _mutation(order: dict[str, Any]) -> dict[str, Any]:
        """Returns only fields exposed by audit and cancellation mutations."""
        return {
            key: order.get(key)
            for key in ("dsOrderNo", "status", "tipType", "tipMsg")
            if key in order
        }

    @staticmethod
    def _page_item(order: dict[str, Any]) -> dict[str, Any]:
        """Projects an internal fixture order into the list response contract."""
        keys = [
            "id",
            "dsOrderNo",
            "externalCode",
            "referenceId",
            "salePlatform",
            "warehouseCode",
            "warehouseName",
            "transportMode",
            "carrierType",
            "status",
            "createdAt",
            "cancelTime",
            "cancelMsg",
            "tipType",
            "tipMsg",
            "carrierCode",
            "carrierName",
            "trackingNo",
            "tenantCode",
            "tenantName",
            "operationsManagerCode",
            "operationsManagerName",
            "operationsManagerEmail",
            "dsShipmentCode",
            "details",
        ]
        result = {key: copy.deepcopy(order[key]) for key in keys if key in order}
        result["shipTo"] = ", ".join(
            filter(
                None,
                [
                    order.get("address1"),
                    order.get("city"),
                    order.get("province"),
                    order.get("country"),
                ],
            )
        )
        result["totalQuantity"] = sum(item.get("shipQuantity", 0) for item in order["details"])
        return result

    @staticmethod
    def _fixture(tenant: str) -> dict[str, Any]:
        """Builds deterministic tenant-local order and log fixtures."""
        statuses = [
            "PENDING_AUDIT",
            "PROCESSING",
            "IN_DISTRIBUTION",
            "IN_TRANSIT",
            "COMPLETED",
            "CANCEL_PENDING_AUDIT",
        ]
        orders = []
        for index, status in enumerate(statuses, 1):
            padded = f"{index:03d}"
            platform = "EBAY" if index % 2 == 0 else "AMAZON"
            detail = {
                "asku": f"MOCK-ASKU-{padded}",
                "asin": f"B0MOCK{padded}",
                "msku": f"MOCK-MSKU-{padded}",
                "productName": f"Mock Product {index}",
                "shipQuantity": index + 1,
                "availableQuantity": 100 - index,
            }
            if platform == "EBAY":
                detail.update(
                    {
                        "ebayTransactionId": f"MOCK-TRANSACTION-{padded}",
                        "ebayItemId": f"MOCK-ITEM-{padded}",
                    }
                )
            order = {
                "id": index,
                "dsOrderNo": f"DS-MOCK-{padded}",
                "dsShipmentCode": f"SHIP-MOCK-{padded}",
                "externalCode": f"EXT-MOCK-{padded}",
                "tenantCode": tenant,
                "tenantName": f"{tenant} Mock Supplier",
                "salePlatform": platform,
                "warehouseCode": f"WH-MOCK-{'WEST' if index % 2 == 0 else 'EAST'}",
                "warehouseName": f"Mock Warehouse {'West' if index % 2 == 0 else 'East'}",
                "referenceId": f"REF-MOCK-{padded}",
                "transportMode": "TRUCK_DELIVERY" if index % 2 == 0 else "EXPRESS",
                "carrierType": "CUSTOMER_LOGISTICS_SELF_PICKUP"
                if index % 2 == 0
                else "PLATFORM_COLLABORATIVE_LOGISTICS",
                "carrierCode": f"CARRIER-{padded}",
                "carrierName": f"Mock Carrier {index}",
                "trackingNo": f"TRACK-MOCK-{padded}",
                "receiverName": f"Mock Receiver {index}",
                "phoneNo": f"000-000-{padded}",
                "email": f"receiver{index}@example.invalid",
                "country": "US",
                "province": "Mock State",
                "city": "Mock City",
                "zipCode": f"000{index}0",
                "address1": f"{index} Mock Street",
                "address2": "Mock Suite",
                "shippingLabelList": [],
                "status": status,
                "operationsManagerCode": f"MOCK-OP-{'B' if index % 2 == 0 else 'A'}",
                "operationsManagerName": f"Mock Operator {'B' if index % 2 == 0 else 'A'}",
                "operationsManagerEmail": "operator@example.invalid",
                "remark": "仅用于 Business Agent 工具演示的虚构订单",
                "signFlag": index % 2 == 1,
                "liftgateFlag": index % 2 == 0,
                "details": [detail],
                "createdAt": BASE_CREATED_AT + index * 86_400_000,
                "mainResponsiblePersonFlag": index % 2 == 1,
            }
            orders.append(order)
        orders[5]["cancelPreviousStatus"] = "PROCESSING"
        logs = {
            item["dsOrderNo"]: [
                {
                    "operator": "Mock System",
                    "operatorEmail": "mock@example.invalid",
                    "bizType": "CREATE",
                    "createdAt": item["createdAt"],
                    "content": f"创建 Mock 一件代发订单 {item['dsOrderNo']}",
                    "status": "SUCCESS",
                }
            ]
            for item in orders
        }
        return {"orders": orders, "logs": logs}
