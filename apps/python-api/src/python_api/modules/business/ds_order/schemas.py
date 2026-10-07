from typing import Literal, Self

from pydantic import Field, model_validator

from python_api.core.schemas import ApiModel

OrderStatus = Literal[
    "DRAFT",
    "PENDING_AUDIT",
    "REJECTED",
    "PROCESSING",
    "IN_DISTRIBUTION",
    "IN_TRANSIT",
    "COMPLETED",
    "CANCEL_PENDING_AUDIT",
    "CANCELLED",
]


class SortRequest(ApiModel):
    """Describes one compatible order sort."""

    column: str
    asc: bool | None = None


class ProductIdRequest(ApiModel):
    """Carries product identifier fields and accepted values."""

    key: list[str] | None = None
    value: list[str] | None = None


class DsOrderPageRequest(ApiModel):
    """Mirrors the OMS order page filter contract."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, alias="pageSize", ge=1, le=100)
    query_enabled: bool | None = Field(default=None, alias="queryEnabled")
    query_deleted: bool | None = Field(default=None, alias="queryDeleted")
    search_count: bool | None = Field(default=None, alias="searchCount")
    orders: list[SortRequest] | None = None
    id_list: list[int] | None = Field(default=None, alias="idList")
    ds_order_no_list: list[str] | None = Field(default=None, alias="dsOrderNoList")
    external_code_list: list[str] | None = Field(default=None, alias="externalCodeList")
    tenant_code_list: list[str] | None = Field(default=None, alias="tenantCodeList")
    status_list: OrderStatus | None = Field(default=None, alias="statusList")
    transport_mode: Literal["EXPRESS", "TRUCK_DELIVERY"] | None = Field(
        default=None, alias="transportMode"
    )
    sale_platform_list: list[str] | None = Field(default=None, alias="salePlatformList")
    product_id_param: ProductIdRequest | None = Field(default=None, alias="productIdParam")
    product_name_list: list[str] | None = Field(default=None, alias="productNameList")
    main_responsible_person_flag: bool | None = Field(
        default=None, alias="mainResponsiblePersonFlag"
    )
    operations_manager_code_list: list[str] | None = Field(
        default=None, alias="operationsManagerCodeList"
    )
    created_at_start: int | None = Field(default=None, alias="createdAtStart")
    created_at_end: int | None = Field(default=None, alias="createdAtEnd")
    carrier_type: (
        Literal["PLATFORM_COLLABORATIVE_LOGISTICS", "CUSTOMER_LOGISTICS_SELF_PICKUP"] | None
    ) = Field(default=None, alias="carrierType")


class DsOrderInfoRequest(ApiModel):
    """Selects one order and optional inventory quantities."""

    ds_order_no: str = Field(alias="dsOrderNo", min_length=1)
    query_available_quantity: Literal[0, 1] | None = Field(
        default=None, alias="queryAvailableQuantity"
    )


class DsOrderLogPageRequest(ApiModel):
    """Pages operation logs for one order."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, alias="pageSize", ge=1, le=100)
    ds_order_no: str = Field(alias="dsOrderNo", min_length=1)


class DsOrderAuditRequest(ApiModel):
    """Approves or rejects an order or cancellation audit."""

    ds_order_no: str = Field(alias="dsOrderNo", min_length=1)
    passed: Literal[0, 1]
    msg: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def require_rejection_message(self) -> Self:
        """Matches ValidateIf for rejected audits."""
        if self.passed == 0 and not (self.msg and self.msg.strip()):
            raise ValueError("msg should not be empty")
        return self


class DsOrderCancelRequest(ApiModel):
    """Requests cancellation for an eligible order."""

    ds_order_no: str = Field(alias="dsOrderNo", min_length=1)
    cancel_msg: str = Field(alias="cancelMsg", min_length=1, max_length=500)
