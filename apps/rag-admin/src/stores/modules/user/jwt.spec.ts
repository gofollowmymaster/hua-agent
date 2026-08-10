import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseJwtPayload, resolveUserInfo } from './jwt';

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createJwt(payload: Record<string, unknown>) {
  const header = encodeBase64(JSON.stringify({ alg: 'none' }));
  const body = encodeBase64(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('jwt user info parsing', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      atob: (value: string) => Buffer.from(value, 'base64').toString('binary')
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses camelCase and snake_case claims', () => {
    const token = createJwt({
      tenant_name: 'Aplus',
      supplier_code: 'A',
      userName: 'Alice'
    });

    expect(parseJwtPayload(token)).toMatchObject({
      tenant_name: 'Aplus',
      supplier_code: 'A'
    });
    expect(resolveUserInfo(token)).toMatchObject({
      tenantName: 'Aplus',
      supplierCode: 'A',
      userName: 'Alice'
    });
  });

  it('returns an empty user info for malformed tokens', () => {
    expect(resolveUserInfo('not-a-jwt')).toEqual({});
  });
});
