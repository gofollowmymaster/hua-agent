import { describe, expect, it } from 'vitest';
import {
  resolveTenantAuthConfig,
  resolveTenantDisplayName,
  type TenantSupplierCode
} from './tenant-auth.config';

describe('resolveTenantAuthConfig', () => {
  it.each<[string, TenantSupplierCode]>([
    ['admin.aplnk.com', 'A'],
    ['admin.test-com.elnkpro.com', 'C'],
    ['admin.yurexcc.com', 'D']
  ])('resolves %s to tenant %s', (hostname, supplierCode) => {
    expect(resolveTenantAuthConfig(hostname).supplierCode).toBe(supplierCode);
  });

  it.each(['', 'localhost', 'aplnk.com.example.com', 'fake-aplnk.com'])(
    'falls back to D for unmatched hostname %s',
    (hostname) => {
      expect(resolveTenantAuthConfig(hostname).supplierCode).toBe('D');
    }
  );
});

describe('resolveTenantDisplayName', () => {
  it('maps configured supplier codes', () => {
    expect(resolveTenantDisplayName('A')).toBe('Aplus');
    expect(resolveTenantDisplayName('C')).toBe('小往');
    expect(resolveTenantDisplayName('D')).toBe('Yurex');
  });
});
