import {
  DsOrderCarrierType,
  DsOrderLogStatus,
  DsOrderStatus,
  DsOrderTransportMode,
  type DsOrderMockRecord,
  type DsOrderTenantState,
} from '../type/ds-order.type';

const BASE_CREATED_AT = Date.parse('2026-09-01T08:00:00+08:00');

/** 为指定租户创建一套完全独立的虚构 DS 订单数据。 */
export function createDsOrderTenantFixture(
  tenantCode: string,
): DsOrderTenantState {
  const statuses = [
    DsOrderStatus.PENDING_AUDIT,
    DsOrderStatus.PROCESSING,
    DsOrderStatus.IN_DISTRIBUTION,
    DsOrderStatus.IN_TRANSIT,
    DsOrderStatus.COMPLETED,
    DsOrderStatus.CANCEL_PENDING_AUDIT,
  ];
  const orders = statuses.map((status, index) =>
    createOrder(tenantCode, index + 1, status),
  );
  orders[5].cancelPreviousStatus = DsOrderStatus.PROCESSING;

  return {
    orders,
    logs: Object.fromEntries(
      orders.map((order) => [
        order.dsOrderNo,
        [
          {
            operator: 'Mock System',
            operatorEmail: 'mock@example.invalid',
            bizType: 'CREATE',
            createdAt: order.createdAt,
            content: `创建 Mock 一件代发订单 ${order.dsOrderNo}`,
            status: DsOrderLogStatus.SUCCESS,
          },
        ],
      ]),
    ),
  };
}

function createOrder(
  tenantCode: string,
  sequence: number,
  status: DsOrderStatus,
): DsOrderMockRecord {
  const padded = String(sequence).padStart(3, '0');
  const createdAt = BASE_CREATED_AT + sequence * 86_400_000;
  const platform = sequence % 2 === 0 ? 'EBAY' : 'AMAZON';
  const transportMode =
    sequence % 2 === 0
      ? DsOrderTransportMode.TRUCK_DELIVERY
      : DsOrderTransportMode.EXPRESS;
  const details = [
    {
      asku: `MOCK-ASKU-${padded}`,
      asin: `B0MOCK${padded}`,
      msku: `MOCK-MSKU-${padded}`,
      productName: `Mock Product ${sequence}`,
      shipQuantity: sequence + 1,
      availableQuantity: 100 - sequence,
      ...(platform === 'EBAY'
        ? {
            ebayTransactionId: `MOCK-TRANSACTION-${padded}`,
            ebayItemId: `MOCK-ITEM-${padded}`,
          }
        : {}),
    },
  ];

  return {
    id: sequence,
    dsOrderNo: `DS-MOCK-${padded}`,
    dsShipmentCode: `SHIP-MOCK-${padded}`,
    externalCode: `EXT-MOCK-${padded}`,
    tenantCode,
    tenantName: `${tenantCode} Mock Supplier`,
    salePlatform: platform,
    warehouseCode: `WH-MOCK-${sequence % 2 === 0 ? 'WEST' : 'EAST'}`,
    warehouseName: `Mock Warehouse ${sequence % 2 === 0 ? 'West' : 'East'}`,
    referenceId: `REF-MOCK-${padded}`,
    transportMode,
    carrierType:
      sequence % 2 === 0
        ? DsOrderCarrierType.CUSTOMER_LOGISTICS_SELF_PICKUP
        : DsOrderCarrierType.PLATFORM_COLLABORATIVE_LOGISTICS,
    carrierCode: `CARRIER-${padded}`,
    carrierName: `Mock Carrier ${sequence}`,
    trackingNo: `TRACK-MOCK-${padded}`,
    receiverName: `Mock Receiver ${sequence}`,
    phoneNo: `000-000-${padded}`,
    email: `receiver${sequence}@example.invalid`,
    country: 'US',
    province: 'Mock State',
    city: 'Mock City',
    zipCode: `000${sequence}0`,
    address1: `${sequence} Mock Street`,
    address2: 'Mock Suite',
    shippingLabelList: [],
    status,
    operationsManagerCode: `MOCK-OP-${sequence % 2 === 0 ? 'B' : 'A'}`,
    operationsManagerName: `Mock Operator ${sequence % 2 === 0 ? 'B' : 'A'}`,
    operationsManagerEmail: 'operator@example.invalid',
    remark: '仅用于 Business Agent 工具演示的虚构订单',
    signFlag: sequence % 2 === 1,
    liftgateFlag: sequence % 2 === 0,
    details,
    createdAt,
    mainResponsiblePersonFlag: sequence % 2 === 1,
  };
}
