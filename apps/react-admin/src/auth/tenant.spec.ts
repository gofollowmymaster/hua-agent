import { describe, expect, it } from 'vitest';
import { resolveTenantAuthConfig } from './tenant';

describe('resolveTenantAuthConfig', () => {
  it('matches exact and subdomain suffixes', () => {
    expect(resolveTenantAuthConfig('uat.elnkpro.com').supplierCode).toBe('A');
    expect(resolveTenantAuthConfig('admin.clouboat.com').supplierCode).toBe(
      'C',
    );
  });

  it('falls back to tenant D for unknown hosts', () => {
    expect(resolveTenantAuthConfig('localhost')).toEqual({
      supplierCode: 'D',
      displayName: 'Yurex',
    });
  });
});
