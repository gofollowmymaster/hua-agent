from typing import Any

from fastapi import APIRouter, Depends

from python_api.modules.auth.dependencies import require_composite_auth
from python_api.modules.business.ds_order.schemas import (
    DsOrderAuditRequest,
    DsOrderCancelRequest,
    DsOrderInfoRequest,
    DsOrderLogPageRequest,
    DsOrderPageRequest,
)
from python_api.modules.business.ds_order.service import DsOrderService

router = APIRouter(
    prefix="/oms/admin/dsOrder",
    tags=["一件代发订单 Mock"],
    dependencies=[Depends(require_composite_auth)],
)


@router.post("/page")
async def page(body: DsOrderPageRequest) -> dict[str, Any]:
    """Pages fixture orders."""
    return DsOrderService().page(body)


@router.post("/info")
async def info(body: DsOrderInfoRequest) -> dict[str, Any]:
    """Returns fixture order details."""
    return DsOrderService().info(body)


@router.post("/logPage")
async def log_page(body: DsOrderLogPageRequest) -> dict[str, Any]:
    """Pages fixture order logs."""
    return DsOrderService().log_page(body)


@router.post("/audit")
async def audit(body: DsOrderAuditRequest) -> dict[str, Any]:
    """Audits a fixture order."""
    return DsOrderService().audit(body)


@router.post("/cancel")
async def cancel(body: DsOrderCancelRequest) -> dict[str, Any]:
    """Submits fixture order cancellation."""
    return DsOrderService().cancel(body)
