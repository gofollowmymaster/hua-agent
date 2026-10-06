from __future__ import annotations

from datetime import datetime
from typing import Any

BASE_CREATED_AT = int(datetime.fromisoformat("2026-09-01T08:00:00+08:00").timestamp() * 1000)

def build_fixture(tenant: str) -> dict[str, Any]:
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
