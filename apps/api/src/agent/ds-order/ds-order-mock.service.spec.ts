import { BadRequestException } from '@nestjs/common';
import { DsOrderMockService } from './ds-order-mock.service';
import { DsOrderStatus } from './type/ds-order.type';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn().mockReturnValue('yurex'),
  },
}));

describe('DsOrderMockService', () => {
  let tenantContext: {
    tenant?: string;
    user?: { username?: string; loginId?: string };
  };
  let service: DsOrderMockService;

  beforeEach(() => {
    tenantContext = {
      tenant: 'yurex',
      user: { username: 'Test User', loginId: 'test@example.invalid' },
    };
    service = new DsOrderMockService(tenantContext as any);
  });

  it('filters and paginates orders with stable default ordering', () => {
    const result = service.page({
      statusList: DsOrderStatus.PROCESSING,
      salePlatformList: ['EBAY'],
      page: 1,
      pageSize: 2,
    });

    expect(result).toMatchObject({ current: 1, size: 2, total: 1 });
    expect(result.records[0]).toMatchObject({
      dsOrderNo: 'DS-MOCK-002',
      status: DsOrderStatus.PROCESSING,
      tenantCode: 'yurex',
    });
    expect(
      service.page({ page: 1, pageSize: 2 }).records.map((item) => item.id),
    ).toEqual([6, 5]);
  });

  it('includes available quantity only when explicitly requested', () => {
    const withoutQuantity = service.info({ dsOrderNo: 'DS-MOCK-001' });
    const withQuantity = service.info({
      dsOrderNo: 'DS-MOCK-001',
      queryAvailableQuantity: 1,
    });

    expect(withoutQuantity.details[0]).not.toHaveProperty('availableQuantity');
    expect(withQuantity.details[0].availableQuantity).toBe(99);
  });

  it('keeps mutable order state isolated by tenant', () => {
    service.cancel({
      dsOrderNo: 'DS-MOCK-002',
      cancelMsg: 'Mock cancellation',
    });
    expect(service.info({ dsOrderNo: 'DS-MOCK-002' }).status).toBe(
      DsOrderStatus.CANCEL_PENDING_AUDIT,
    );

    tenantContext.tenant = 'aplus';
    expect(service.info({ dsOrderNo: 'DS-MOCK-002' })).toMatchObject({
      tenantCode: 'aplus',
      status: DsOrderStatus.PROCESSING,
    });
  });

  it('audits a pending order and appends an operation log', () => {
    const result = service.audit({
      dsOrderNo: 'DS-MOCK-001',
      passed: 1,
    });

    expect(result.status).toBe(DsOrderStatus.PROCESSING);
    const logs = service.logPage({
      dsOrderNo: 'DS-MOCK-001',
      page: 1,
      pageSize: 10,
    });
    expect(logs.total).toBe(2);
    expect(logs.records[0]).toMatchObject({
      operator: 'Test User',
      bizType: 'AUDIT',
    });
  });

  it('rejects a pending order with the supplied reason', () => {
    const result = service.audit({
      dsOrderNo: 'DS-MOCK-001',
      passed: 0,
      msg: 'Mock audit rejection',
    });

    expect(result).toMatchObject({
      status: DsOrderStatus.REJECTED,
      tipType: 'SUBMIT_REJECTED',
      tipMsg: 'Mock audit rejection',
    });
  });

  it('restores the previous status when cancellation audit is rejected', () => {
    service.cancel({
      dsOrderNo: 'DS-MOCK-002',
      cancelMsg: 'Customer request',
    });
    const result = service.audit({
      dsOrderNo: 'DS-MOCK-002',
      passed: 0,
      msg: 'Cancellation rejected',
    });

    expect(result).toMatchObject({
      status: DsOrderStatus.PROCESSING,
      tipType: 'CANCEL_REJECTED',
    });
  });

  it('completes an approved cancellation request', () => {
    service.cancel({
      dsOrderNo: 'DS-MOCK-003',
      cancelMsg: 'Customer request',
    });
    const result = service.audit({
      dsOrderNo: 'DS-MOCK-003',
      passed: 1,
    });

    expect(result.status).toBe(DsOrderStatus.CANCELLED);
    expect(service.info({ dsOrderNo: 'DS-MOCK-003' }).cancelTime).toEqual(
      expect.any(Number),
    );
  });

  it('rejects writes that are invalid for the current status', () => {
    expect(() =>
      service.cancel({
        dsOrderNo: 'DS-MOCK-005',
        cancelMsg: 'Invalid',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.audit({ dsOrderNo: 'DS-MOCK-001', passed: 0 }),
    ).toThrow('审核驳回原因不能为空');
  });
});
