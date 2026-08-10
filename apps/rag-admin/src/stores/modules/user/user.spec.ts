import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureLogin: vi.fn(),
  getCurrentUserInfo: vi.fn(),
  logout: vi.fn()
}));

vi.mock('./auth', () => ({
  ensureLogin: mocks.ensureLogin,
  getCurrentUserInfo: mocks.getCurrentUserInfo,
  logout: mocks.logout,
  tenantAuthConfig: { supplierCode: 'D' }
}));

import { useUserStore } from './index';

interface MemoryStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

function createMemoryStorage(): MemoryStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    }
  };
}

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

describe('useUserStore', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = createMemoryStorage();
    vi.stubGlobal('window', {
      atob: (value: string) => Buffer.from(value, 'base64').toString('binary'),
      localStorage: storage,
      document: { cookie: '' }
    });

    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    createApp({}).use(pinia);
    setActivePinia(pinia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses tenant info from the JWT payload', () => {
    const store = useUserStore();

    store.setToken(
      createJwt({
        tenantName: '小往',
        supplierCode: 'C',
        tenantCode: 'boat'
      })
    );

    expect(store.userInfo).toMatchObject({
      tenantName: '小往',
      supplierCode: 'C',
      tenantCode: 'boat'
    });
    expect(store.supplierCode).toBe('C');
    expect(store.tenantDisplayName).toBe('小往');
  });

  it('supports snake_case JWT claims', () => {
    const store = useUserStore();

    store.setToken(
      createJwt({
        tenant_name: 'Aplus',
        supplier_code: 'A'
      })
    );

    expect(store.userInfo).toMatchObject({
      tenantName: 'Aplus',
      supplierCode: 'A'
    });
    expect(store.tenantDisplayName).toBe('Aplus');
  });

  it('uses supplierName when tenantName is missing', () => {
    const store = useUserStore();

    store.setToken(
      createJwt({
        supplierName: 'Yurex',
        supplierCode: 'D'
      })
    );

    expect(store.tenantDisplayName).toBe('Yurex');
  });

  it('falls back to the resolved host tenant when token has no tenant info', () => {
    const store = useUserStore();

    expect(store.supplierCode).toBe('D');
    expect(store.tenantDisplayName).toBe('Yurex');
  });

  it('keeps token tenant info when SDK user info omits it', () => {
    const token = createJwt({
      tenantName: 'Aplus',
      supplierCode: 'A'
    });
    const store = useUserStore();
    store.setToken(token);

    store.setUserInfo({ userName: 'Alice' });

    expect(store.userInfo.tenantName).toBe('Aplus');
    expect(store.tenantDisplayName).toBe('Aplus');
    expect(store.userInfo.userName).toBe('Alice');
  });

  it('persists token and userInfo under authToken', async () => {
    const token = createJwt({
      tenantName: 'Aplus',
      supplierCode: 'A',
      userName: 'Alice'
    });
    const store = useUserStore();

    expect(store.$persist).toBeTypeOf('function');
    store.setToken(token);
    await nextTick();

    expect(JSON.parse(storage.getItem('authToken')!)).toMatchObject({
      token,
      userInfo: {
        tenantName: 'Aplus',
        supplierCode: 'A',
        userName: 'Alice'
      }
    });
  });

  it('restores loginReady and user info from persisted authToken', () => {
    const token = createJwt({
      tenantName: 'Aplus',
      supplierCode: 'A'
    });
    storage.setItem('authToken', JSON.stringify({ token }));

    const store = useUserStore();

    expect(store.token).toBe(token);
    expect(store.loginReady).toBe(true);
    expect(store.userInfo.tenantName).toBe('Aplus');
  });

  it('clears persisted token on logout', async () => {
    const store = useUserStore();
    store.setToken(createJwt({ tenantName: 'Aplus', supplierCode: 'A' }));

    store.logout();
    await nextTick();

    expect(JSON.parse(storage.getItem('authToken')!)).not.toHaveProperty(
      'token'
    );
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('merges SDK user info without clearing token claims', async () => {
    const token = createJwt({
      tenantName: 'Aplus',
      supplierCode: 'A'
    });
    mocks.ensureLogin.mockResolvedValue(token);
    mocks.getCurrentUserInfo.mockResolvedValue({ userName: 'Alice' });
    const store = useUserStore();

    await store.ensureLogin();

    expect(store.token).toBe(token);
    expect(store.userInfo.tenantName).toBe('Aplus');
    expect(store.userInfo.userName).toBe('Alice');
    expect(store.loginReady).toBe(true);
  });
});
