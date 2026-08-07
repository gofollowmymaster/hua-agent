import { NotFoundException } from '@nestjs/common';
import { GlobalAdminTenantService } from './tenant.service';

describe('GlobalAdminTenantService', () => {
  const service = new GlobalAdminTenantService();

  it('lists tenants in supplier order with only public summary fields', () => {
    const result = service.list();

    expect(result.map((item) => item.supplierCode)).toEqual(['A', 'C', 'D']);
    expect(result.map((item) => item.displayName)).toEqual([
      'Aplus',
      '小往',
      'Yurex',
    ]);
    result.forEach((item) => {
      expect(Object.keys(item).sort()).toEqual(
        ['displayName', 'hostTag', 'supplierCode', 'tenantCode'].sort(),
      );
    });
  });

  it('returns capability booleans without sensitive configuration values', () => {
    const result = service.get('boat');
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      supplierCode: 'C',
      tenantCode: 'boat',
      displayName: '小往',
      capabilities: {
        wiki: true,
        auth: true,
        aily: true,
        wecomBot: true,
      },
    });
    expect(serialized).not.toMatch(
      /appId|appSecret|token|secret|tableId|wikiSpaceId|botId/i,
    );
  });

  it('returns 404 for an unknown tenant', () => {
    expect(() => service.get('unknown')).toThrow(NotFoundException);
  });
});
