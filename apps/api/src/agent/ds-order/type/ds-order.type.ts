export enum DsOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_AUDIT = 'PENDING_AUDIT',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  IN_DISTRIBUTION = 'IN_DISTRIBUTION',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCEL_PENDING_AUDIT = 'CANCEL_PENDING_AUDIT',
  CANCELLED = 'CANCELLED',
}

export enum DsOrderTransportMode {
  EXPRESS = 'EXPRESS',
  TRUCK_DELIVERY = 'TRUCK_DELIVERY',
}

export enum DsOrderCarrierType {
  PLATFORM_COLLABORATIVE_LOGISTICS = 'PLATFORM_COLLABORATIVE_LOGISTICS',
  CUSTOMER_LOGISTICS_SELF_PICKUP = 'CUSTOMER_LOGISTICS_SELF_PICKUP',
}

export enum DsOrderLogStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface DsOrderDetail {
  asku?: string;
  asin?: string;
  msku?: string;
  productName?: string;
  shipQuantity?: number;
  availableQuantity?: number;
  ebayTransactionId?: string;
  ebayItemId?: string;
}

export interface DsOrderFileInfo {
  fileName?: string;
  filePath?: string;
}

export interface DsOrderInfo {
  id: number;
  dsOrderNo: string;
  dsShipmentCode?: string;
  externalCode?: string;
  tenantCode: string;
  tenantName?: string;
  salePlatform?: string;
  warehouseCode?: string;
  warehouseName?: string;
  referenceId?: string;
  transportMode?: DsOrderTransportMode;
  carrierType?: DsOrderCarrierType;
  carrierCode?: string;
  carrierName?: string;
  trackingNo?: string;
  receiverName?: string;
  phoneNo?: string;
  email?: string;
  country?: string;
  province?: string;
  city?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  shippingLabelList?: DsOrderFileInfo[];
  status: DsOrderStatus;
  tipType?: string;
  tipMsg?: string;
  operationsManagerCode?: string;
  operationsManagerName?: string;
  operationsManagerEmail?: string;
  remark?: string;
  signFlag?: boolean;
  liftgateFlag?: boolean;
  details: DsOrderDetail[];
  createdAt: number;
  cancelTime?: number;
  cancelMsg?: string;
  mainResponsiblePersonFlag?: boolean;
}

export interface DsOrderPageItem {
  id: number;
  dsOrderNo: string;
  externalCode?: string;
  referenceId?: string;
  salePlatform?: string;
  warehouseCode?: string;
  warehouseName?: string;
  transportMode?: DsOrderTransportMode;
  carrierType?: DsOrderCarrierType;
  shipTo?: string;
  status: DsOrderStatus;
  createdAt: number;
  cancelTime?: number;
  cancelMsg?: string;
  totalQuantity: number;
  tipType?: string;
  tipMsg?: string;
  carrierCode?: string;
  carrierName?: string;
  trackingNo?: string;
  tenantCode: string;
  tenantName?: string;
  operationsManagerCode?: string;
  operationsManagerName?: string;
  operationsManagerEmail?: string;
  dsShipmentCode?: string;
  details: DsOrderDetail[];
}

export interface DsOrderLog {
  operator: string;
  operatorEmail?: string;
  bizType: string;
  createdAt: number;
  content: string;
  status: DsOrderLogStatus;
}

export interface DsOrderPageResult<T> {
  records: T[];
  size: number;
  current: number;
  total: number;
}

export interface DsOrderMockRecord extends DsOrderInfo {
  cancelPreviousStatus?: DsOrderStatus;
}

export interface DsOrderTenantState {
  orders: DsOrderMockRecord[];
  logs: Record<string, DsOrderLog[]>;
}
