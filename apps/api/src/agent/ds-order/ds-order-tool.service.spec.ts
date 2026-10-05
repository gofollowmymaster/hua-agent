import { DsOrderToolService } from './ds-order-tool.service';
import { DsOrderStatus } from './type/ds-order.type';

describe('DsOrderToolService', () => {
  const dsOrderService = {
    page: jest.fn(),
    info: jest.fn(),
    logPage: jest.fn(),
    audit: jest.fn(),
    cancel: jest.fn(),
  };
  let service: DsOrderToolService;

  beforeEach(() => {
    jest.clearAllMocks();
    dsOrderService.page.mockReturnValue({ records: [], total: 0 });
    dsOrderService.info.mockReturnValue({
      dsOrderNo: 'DS-MOCK-001',
      status: DsOrderStatus.PENDING_AUDIT,
    });
    dsOrderService.logPage.mockReturnValue({ records: [], total: 0 });
    dsOrderService.audit.mockReturnValue({
      dsOrderNo: 'DS-MOCK-001',
      status: DsOrderStatus.PROCESSING,
    });
    dsOrderService.cancel.mockReturnValue({
      dsOrderNo: 'DS-MOCK-002',
      status: DsOrderStatus.CANCEL_PENDING_AUDIT,
    });
    service = new DsOrderToolService(dsOrderService as any);
  });

  it('exposes the five DS order tools', () => {
    expect(service.getTools().map((item) => item.name)).toEqual([
      'list_ds_orders',
      'get_ds_order',
      'list_ds_order_logs',
      'audit_ds_order',
      'cancel_ds_order',
    ]);
  });

  it('delegates query tools and returns compact JSON', async () => {
    const listTool = service
      .getTools()
      .find((item) => item.name === 'list_ds_orders')!;
    const infoTool = service
      .getTools()
      .find((item) => item.name === 'get_ds_order')!;

    expect(JSON.parse(await listTool.invoke({ pageSize: 5 }))).toEqual({
      records: [],
      total: 0,
    });
    await infoTool.invoke({
      dsOrderNo: 'DS-MOCK-001',
      queryAvailableQuantity: true,
    });
    expect(dsOrderService.info).toHaveBeenCalledWith({
      dsOrderNo: 'DS-MOCK-001',
      queryAvailableQuantity: 1,
    });
  });

  it('requires a reason when rejecting an audit', async () => {
    const auditTool = service
      .getTools()
      .find((item) => item.name === 'audit_ds_order')!;

    await expect(
      auditTool.invoke({ dsOrderNo: 'DS-MOCK-001', passed: 0 }),
    ).rejects.toThrow();
    expect(dsOrderService.audit).not.toHaveBeenCalled();
  });

  it('delegates explicit audit and cancellation operations', async () => {
    const auditTool = service
      .getTools()
      .find((item) => item.name === 'audit_ds_order')!;
    const cancelTool = service
      .getTools()
      .find((item) => item.name === 'cancel_ds_order')!;

    await auditTool.invoke({ dsOrderNo: 'DS-MOCK-001', passed: 1 });
    await cancelTool.invoke({
      dsOrderNo: 'DS-MOCK-002',
      cancelMsg: 'Mock reason',
    });
    expect(dsOrderService.audit).toHaveBeenCalledWith({
      dsOrderNo: 'DS-MOCK-001',
      passed: 1,
    });
    expect(dsOrderService.cancel).toHaveBeenCalledWith({
      dsOrderNo: 'DS-MOCK-002',
      cancelMsg: 'Mock reason',
    });
  });
});
