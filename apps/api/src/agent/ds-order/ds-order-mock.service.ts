import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import type {
  DsOrderAuditDto,
  DsOrderCancelDto,
  DsOrderInfoDto,
  DsOrderLogPageDto,
  DsOrderPageDto,
} from './dto/ds-order.dto';
import { createDsOrderTenantFixture } from './mock/ds-order.fixture';
import {
  DsOrderLogStatus,
  DsOrderStatus,
  type DsOrderDetail,
  type DsOrderInfo,
  type DsOrderLog,
  type DsOrderMockRecord,
  type DsOrderPageItem,
  type DsOrderPageResult,
  type DsOrderTenantState,
} from './type/ds-order.type';

const SORTABLE_FIELDS = new Set([
  'id',
  'dsOrderNo',
  'externalCode',
  'status',
  'salePlatform',
  'createdAt',
]);

/** 提供按租户隔离的一件代发订单内存 Mock 查询和状态流转。 */
@Injectable()
export class DsOrderMockService {
  private readonly states = new Map<string, DsOrderTenantState>();

  constructor(private readonly tenantContext: TenantContext) {}

  /** 按当前租户、筛选条件和排序规则分页返回订单。 */
  page(params: DsOrderPageDto): DsOrderPageResult<DsOrderPageItem> {
    const state = this.currentState();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const filtered = state.orders.filter((order) =>
      this.matchesFilters(order, params),
    );
    this.sortOrders(filtered, params);
    const start = (page - 1) * pageSize;

    return {
      records: filtered
        .slice(start, start + pageSize)
        .map((order) => this.toPageItem(order)),
      size: pageSize,
      current: page,
      total: filtered.length,
    };
  }

  /** 返回当前租户的指定订单详情。 */
  info(params: DsOrderInfoDto): DsOrderInfo {
    const order = this.findOrder(params.dsOrderNo);
    const info = this.toInfo(order);
    if (params.queryAvailableQuantity !== 1) {
      for (const detail of info.details) delete detail.availableQuantity;
    }
    return info;
  }

  /** 分页返回当前租户指定订单的操作日志。 */
  logPage(params: DsOrderLogPageDto): DsOrderPageResult<DsOrderLog> {
    this.findOrder(params.dsOrderNo);
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const logs = [...(this.currentState().logs[params.dsOrderNo] ?? [])].sort(
      (left, right) => right.createdAt - left.createdAt,
    );
    const start = (page - 1) * pageSize;
    return {
      records: structuredClone(logs.slice(start, start + pageSize)),
      size: pageSize,
      current: page,
      total: logs.length,
    };
  }

  /** 审核待审核订单或取消申请，并记录状态变更日志。 */
  audit(params: DsOrderAuditDto) {
    const order = this.findOrder(params.dsOrderNo);
    const beforeStatus = order.status;
    if (
      beforeStatus !== DsOrderStatus.PENDING_AUDIT &&
      beforeStatus !== DsOrderStatus.CANCEL_PENDING_AUDIT
    ) {
      throw new BadRequestException(
        `订单 ${params.dsOrderNo} 当前状态不允许审核`,
      );
    }
    if (params.passed === 0 && !params.msg?.trim()) {
      throw new BadRequestException('审核驳回原因不能为空');
    }

    if (beforeStatus === DsOrderStatus.PENDING_AUDIT) {
      order.status =
        params.passed === 1 ? DsOrderStatus.PROCESSING : DsOrderStatus.REJECTED;
      order.tipType = params.passed === 1 ? undefined : 'SUBMIT_REJECTED';
      order.tipMsg = params.passed === 1 ? undefined : params.msg?.trim();
    } else if (params.passed === 1) {
      order.status = DsOrderStatus.CANCELLED;
      order.cancelTime = Date.now();
      order.tipType = 'CANCELLED';
      order.tipMsg = order.cancelMsg;
      order.cancelPreviousStatus = undefined;
    } else {
      order.status = order.cancelPreviousStatus ?? DsOrderStatus.PROCESSING;
      order.tipType = 'CANCEL_REJECTED';
      order.tipMsg = params.msg?.trim();
      order.cancelPreviousStatus = undefined;
    }

    this.appendLog(
      order.dsOrderNo,
      'AUDIT',
      `审核${params.passed === 1 ? '通过' : '驳回'}：${beforeStatus} -> ${order.status}`,
    );
    return this.mutationResult(order);
  }

  /** 为处理中或配货中的订单提交取消申请，并记录操作日志。 */
  cancel(params: DsOrderCancelDto) {
    const order = this.findOrder(params.dsOrderNo);
    if (
      order.status !== DsOrderStatus.PROCESSING &&
      order.status !== DsOrderStatus.IN_DISTRIBUTION
    ) {
      throw new BadRequestException(
        `订单 ${params.dsOrderNo} 当前状态不允许取消`,
      );
    }
    const beforeStatus = order.status;
    order.cancelPreviousStatus = beforeStatus;
    order.status = DsOrderStatus.CANCEL_PENDING_AUDIT;
    order.cancelMsg = params.cancelMsg.trim();
    order.tipType = undefined;
    order.tipMsg = undefined;
    this.appendLog(
      order.dsOrderNo,
      'CANCEL',
      `提交取消申请：${beforeStatus} -> ${order.status}`,
    );
    return this.mutationResult(order);
  }

  private currentState() {
    const tenantCode = this.currentTenant();
    let state = this.states.get(tenantCode);
    if (!state) {
      state = createDsOrderTenantFixture(tenantCode);
      this.states.set(tenantCode, state);
    }
    return state;
  }

  private currentTenant() {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  private findOrder(dsOrderNo: string) {
    const order = this.currentState().orders.find(
      (item) => item.dsOrderNo === dsOrderNo,
    );
    if (!order) {
      throw new BadRequestException(`一件代发订单 ${dsOrderNo} 不存在`);
    }
    return order;
  }

  private matchesFilters(order: DsOrderMockRecord, params: DsOrderPageDto) {
    if (params.idList?.length && !params.idList.includes(order.id))
      return false;
    if (
      params.dsOrderNoList?.length &&
      !params.dsOrderNoList.includes(order.dsOrderNo)
    ) {
      return false;
    }
    if (
      params.externalCodeList?.length &&
      !params.externalCodeList.includes(order.externalCode ?? '')
    ) {
      return false;
    }
    if (
      params.tenantCodeList?.length &&
      !params.tenantCodeList.includes(order.tenantCode)
    ) {
      return false;
    }
    if (params.statusList && order.status !== params.statusList) return false;
    if (params.transportMode && order.transportMode !== params.transportMode) {
      return false;
    }
    if (
      params.salePlatformList?.length &&
      !params.salePlatformList.includes(order.salePlatform ?? '')
    ) {
      return false;
    }
    if (
      params.operationsManagerCodeList?.length &&
      !params.operationsManagerCodeList.includes(
        order.operationsManagerCode ?? '',
      )
    ) {
      return false;
    }
    if (
      params.mainResponsiblePersonFlag !== undefined &&
      order.mainResponsiblePersonFlag !== params.mainResponsiblePersonFlag
    ) {
      return false;
    }
    if (params.createdAtStart && order.createdAt < params.createdAtStart) {
      return false;
    }
    if (params.createdAtEnd && order.createdAt > params.createdAtEnd) {
      return false;
    }
    if (params.carrierType && order.carrierType !== params.carrierType) {
      return false;
    }
    if (!this.matchesProducts(order.details, params)) return false;
    return true;
  }

  private matchesProducts(details: DsOrderDetail[], params: DsOrderPageDto) {
    if (params.productNameList?.length) {
      const names = params.productNameList.map((name) => name.toLowerCase());
      const matchesName = details.some((detail) =>
        names.some((name) => detail.productName?.toLowerCase().includes(name)),
      );
      if (!matchesName) return false;
    }
    const keys = params.productIdParam?.key ?? [];
    const values = params.productIdParam?.value ?? [];
    if (keys.length && values.length) {
      const allowedKeys = keys.filter((key) =>
        ['asku', 'asin', 'msku'].includes(key),
      ) as Array<'asku' | 'asin' | 'msku'>;
      return details.some((detail) =>
        allowedKeys.some((key) => values.includes(detail[key] ?? '')),
      );
    }
    return true;
  }

  private sortOrders(orders: DsOrderMockRecord[], params: DsOrderPageDto) {
    const sorters = (params.orders ?? []).filter((item) =>
      SORTABLE_FIELDS.has(item.column),
    );
    orders.sort((left, right) => {
      for (const sorter of sorters) {
        const leftValue = left[sorter.column as keyof DsOrderMockRecord];
        const rightValue = right[sorter.column as keyof DsOrderMockRecord];
        if (leftValue === rightValue) continue;
        const comparison = String(leftValue ?? '').localeCompare(
          String(rightValue ?? ''),
          'zh-CN',
          { numeric: true },
        );
        return sorter.asc === false ? -comparison : comparison;
      }
      return right.createdAt - left.createdAt || right.id - left.id;
    });
  }

  private toPageItem(order: DsOrderMockRecord): DsOrderPageItem {
    return {
      id: order.id,
      dsOrderNo: order.dsOrderNo,
      externalCode: order.externalCode,
      referenceId: order.referenceId,
      salePlatform: order.salePlatform,
      warehouseCode: order.warehouseCode,
      warehouseName: order.warehouseName,
      transportMode: order.transportMode,
      carrierType: order.carrierType,
      shipTo: [order.address1, order.city, order.province, order.country]
        .filter(Boolean)
        .join(', '),
      status: order.status,
      createdAt: order.createdAt,
      cancelTime: order.cancelTime,
      cancelMsg: order.cancelMsg,
      totalQuantity: order.details.reduce(
        (total, detail) => total + (detail.shipQuantity ?? 0),
        0,
      ),
      tipType: order.tipType,
      tipMsg: order.tipMsg,
      carrierCode: order.carrierCode,
      carrierName: order.carrierName,
      trackingNo: order.trackingNo,
      tenantCode: order.tenantCode,
      tenantName: order.tenantName,
      operationsManagerCode: order.operationsManagerCode,
      operationsManagerName: order.operationsManagerName,
      operationsManagerEmail: order.operationsManagerEmail,
      dsShipmentCode: order.dsShipmentCode,
      details: structuredClone(order.details),
    };
  }

  private toInfo(order: DsOrderMockRecord): DsOrderInfo {
    const info = structuredClone(order);
    delete info.cancelPreviousStatus;
    return info;
  }

  private appendLog(dsOrderNo: string, bizType: string, content: string) {
    const state = this.currentState();
    const user = this.tenantContext.user;
    const log: DsOrderLog = {
      operator: user?.username ?? user?.supplierName ?? 'Business Agent',
      operatorEmail: user?.loginId,
      bizType,
      createdAt: Date.now(),
      content,
      status: DsOrderLogStatus.SUCCESS,
    };
    state.logs[dsOrderNo] = [...(state.logs[dsOrderNo] ?? []), log];
  }

  private mutationResult(order: DsOrderMockRecord) {
    return {
      dsOrderNo: order.dsOrderNo,
      status: order.status,
      tipType: order.tipType,
      tipMsg: order.tipMsg,
    };
  }
}
