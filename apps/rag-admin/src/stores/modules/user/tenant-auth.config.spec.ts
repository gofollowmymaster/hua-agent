import { describe, expect, it } from 'vitest';
import {
  resolveAuthEnv,
  resolveTenantDisplayName,
  resolveTenantAuthConfig,
  type AuthEnv,
  type TenantSupplierCode
} from './tenant-auth.config';

describe('resolveAuthEnv', () => {
  it('prefers an explicit auth environment over the Vite mode', () => {
    expect(resolveAuthEnv('uat', 'production')).toBe('uat');
  });

  it('normalizes the Vite production mode to the auth prod environment', () => {
    expect(resolveAuthEnv(undefined, 'production')).toBe('prod');
  });

  it.each([
    ['development', 'development'],
    ['dev', 'dev'],
    ['test', 'test'],
    ['uat', 'uat'],
    ['prod', 'prod'],
    [' PRODUCTION ', 'prod']
  ])('normalizes %s to %s', (value, expected) => {
    expect(resolveAuthEnv(value, 'dev')).toBe(expected);
  });

  it('falls back to dev for an unknown environment', () => {
    expect(resolveAuthEnv('', 'preview')).toBe('dev');
  });
});

describe('resolveTenantAuthConfig', () => {
  it.each<[string, TenantSupplierCode]>([
    ['admin.aplnk.com', 'A'],
    ['api.dev-v2.elnkpro.com', 'A'],
    ['ADMIN.TEST-XW.ELNKPRO.COM', 'A'],
    ['admin.uat.elnkpro.com.', 'A'],
    ['rag.clouboat.com', 'C'],
    ['admin.test-com.elnkpro.com', 'C'],
    ['admin.yurexcc.com', 'D']
  ])('resolves %s to tenant %s', (hostname, supplierCode) => {
    expect(resolveTenantAuthConfig(hostname, 'prod').supplierCode).toBe(
      supplierCode
    );
  });

  it.each(['', 'localhost', 'aplnk.com.example.com', 'fake-aplnk.com'])(
    'falls back to D for unmatched hostname %s',
    (hostname) => {
      expect(resolveTenantAuthConfig(hostname, 'dev').supplierCode).toBe('D');
    }
  );

  it.each<[string, AuthEnv, string]>([
    ['admin.aplnk.com', 'prod', 'https://auth.aplnk.com/admin.html#/'],
    [
      'admin.test-com.elnkpro.com',
      'test',
      'https://auth.test-com.elnkpro.com/admin.html#/'
    ],
    ['admin.yurexcc.com', 'uat', 'https://auth.uat.yurexcc.com/admin.html#/'],
    ['localhost', 'development', 'http://auth.dev-v2.yurexcc.com/admin.html#/']
  ])('selects the login URL for %s in %s', (hostname, env, loginUrl) => {
    expect(resolveTenantAuthConfig(hostname, env).loginUrl).toBe(loginUrl);
  });

  it.each<[string, AuthEnv, string]>([
    ['admin.aplnk.com', 'development', ''],
    ['admin.aplnk.com', 'dev', 'http://api.dev-v2.elnkpro.com'],
    ['admin.aplnk.com', 'test', 'https://api.test-com.elnkpro.com'],
    ['admin.aplnk.com', 'uat', 'https://api.uat.elnkpro.com'],
    ['admin.aplnk.com', 'prod', 'https://api.aplnk.com'],
    ['admin.clouboat.com', 'development', ''],
    ['admin.clouboat.com', 'dev', 'http://api.dev-v2.elnkpro.com'],
    ['admin.clouboat.com', 'test', 'https://api.test-com.elnkpro.com'],
    ['admin.clouboat.com', 'uat', 'https://api.uat-cb.clouboat.com'],
    ['admin.clouboat.com', 'prod', 'https://api.clouboat.com'],
    ['admin.yurexcc.com', 'development', ''],
    ['admin.yurexcc.com', 'dev', 'http://api.dev-v2.elnkpro.com'],
    ['admin.yurexcc.com', 'test', 'https://api.test-com.elnkpro.com'],
    ['admin.yurexcc.com', 'uat', 'https://api.uat.yurexcc.com'],
    ['admin.yurexcc.com', 'prod', 'https://api.yurexcc.com']
  ])('selects the API URL for %s in %s', (hostname, env, apiUrl) => {
    expect(resolveTenantAuthConfig(hostname, env).apiUrl).toBe(apiUrl);
  });

  it('uses the D API URL matrix for an unmatched hostname', () => {
    expect(resolveTenantAuthConfig('localhost', 'uat').apiUrl).toBe(
      'https://api.uat.yurexcc.com'
    );
  });
});

describe('resolveTenantDisplayName', () => {
  it.each<[TenantSupplierCode, string]>([
    ['A', 'Aplus'],
    ['C', '小往'],
    ['D', 'Yurex']
  ])('maps %s to %s', (supplierCode, displayName) => {
    expect(resolveTenantDisplayName(supplierCode)).toBe(displayName);
  });

  it('returns undefined for unknown or empty supplier code', () => {
    expect(resolveTenantDisplayName('X')).toBeUndefined();
    expect(resolveTenantDisplayName(undefined)).toBeUndefined();
  });
});
