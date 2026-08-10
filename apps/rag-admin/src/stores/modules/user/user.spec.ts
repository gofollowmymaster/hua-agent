import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureLogin: vi.fn(),
  getCurrentUserInfo: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(),
  setToken: vi.fn()
}));

vi.mock('./auth', () => ({
  ensureLogin: mocks.ensureLogin,
  getCurrentUserInfo: mocks.getCurrentUserInfo,
  logout: mocks.logout,
  tenantAuthConfig: { supplierCode: 'D' }
}));

vi.mock('./token', () => ({
  getToken: mocks.getToken,
  setToken: mocks.setToken
}));

import { useUserStore } from './index';

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

describe('useUserStore tenant info', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {
      atob: (value: string) => Buffer.from(value, 'base64').toString('binary')
    });
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses tenant info from the JWT payload', () => {
    mocks.getToken.mockReturnValue(
      createJwt({
        tenantName: '小往',
        supplierCode: 'C',
        tenantCode: 'boat'
      })
    );

    const store = useUserStore();

    expect(store.userInfo).toMatchObject({
      tenantName: '小往',
      supplierCode: 'C',
      tenantCode: 'boat'
    });
    expect(store.supplierCode).toBe('C');
    expect(store.tenantDisplayName).toBe('小往');
  });

  it('supports snake_case JWT claims', () => {
    mocks.getToken.mockReturnValue(
      createJwt({
        tenant_name: 'Aplus',
        supplier_code: 'A'
      })
    );

    const store = useUserStore();

    expect(store.userInfo).toMatchObject({
      tenantName: 'Aplus',
      supplierCode: 'A'
    });
    expect(store.tenantDisplayName).toBe('Aplus');
  });

  it('uses supplierName when tenantName is missing', () => {
    mocks.getToken.mockReturnValue(
      createJwt({
        supplierName: 'Yurex',
        supplierCode: 'D'
      })
    );

    const store = useUserStore();

    expect(store.tenantDisplayName).toBe('Yurex');
  });

  it('falls back to the resolved host tenant when token has no tenant info', () => {
    mocks.getToken.mockReturnValue(undefined);

    const store = useUserStore();

    expect(store.supplierCode).toBe('D');
    expect(store.tenantDisplayName).toBe('Yurex');
  });

  it('re-parses tenant info when setToken is called', () => {
    mocks.getToken.mockReturnValue(undefined);
    const store = useUserStore();

    store.setToken(
      createJwt({
        tenantName: 'Aplus',
        supplierCode: 'A'
      })
    );

    expect(store.userInfo.tenantName).toBe('Aplus');
    expect(store.supplierCode).toBe('A');
    expect(store.tenantDisplayName).toBe('Aplus');
  });

  it('keeps token tenant info when SDK user info omits it', () => {
    mocks.getToken.mockReturnValue(
      createJwt({
        tenantName: 'Aplus',
        supplierCode: 'A'
      })
    );
    const store = useUserStore();

    store.setUserInfo({ userName: 'Alice' });

    expect(store.userInfo.tenantName).toBe('Aplus');
    expect(store.tenantDisplayName).toBe('Aplus');
    expect(store.userInfo.userName).toBe('Alice');
  });
});
