import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { CompositeAuthOrSecretGuard } from '@src/common/guard/composite-auth';
import { DsOrderController } from './ds-order.controller';

describe('DsOrderController', () => {
  const dsOrderService = {
    page: jest.fn(),
    info: jest.fn(),
    logPage: jest.fn(),
    audit: jest.fn(),
    cancel: jest.fn(),
  };
  const controller = new DsOrderController(dsOrderService as any);

  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['page', 'page'],
    ['info', 'info'],
    ['logPage', 'logPage'],
    ['audit', 'audit'],
    ['cancel', 'cancel'],
  ] as const)('maps %s to POST /oms/admin/dsOrder/%s', (method, path) => {
    const handler = DsOrderController.prototype[method];
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(
      RequestMethod.POST,
    );
  });

  it('uses the existing composite authentication guard', () => {
    expect(Reflect.getMetadata(PATH_METADATA, DsOrderController)).toBe(
      'oms/admin/dsOrder',
    );
    expect(Reflect.getMetadata(GUARDS_METADATA, DsOrderController)).toContain(
      CompositeAuthOrSecretGuard,
    );
  });

  it('delegates request bodies to the mock service', () => {
    const pageBody = { page: 2, pageSize: 5 };
    const infoBody = { dsOrderNo: 'DS-MOCK-001' };
    controller.page(pageBody);
    controller.info(infoBody);
    controller.logPage(infoBody);
    controller.audit({ ...infoBody, passed: 1 });
    controller.cancel({ ...infoBody, cancelMsg: 'Mock reason' });

    expect(dsOrderService.page).toHaveBeenCalledWith(pageBody);
    expect(dsOrderService.info).toHaveBeenCalledWith(infoBody);
    expect(dsOrderService.logPage).toHaveBeenCalledWith(infoBody);
    expect(dsOrderService.audit).toHaveBeenCalledWith({
      ...infoBody,
      passed: 1,
    });
    expect(dsOrderService.cancel).toHaveBeenCalledWith({
      ...infoBody,
      cancelMsg: 'Mock reason',
    });
  });
});
