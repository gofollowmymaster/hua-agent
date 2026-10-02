import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock('@/api/auth/auth', () => ({ login: mocks.login }));

import { useUserStore } from './index';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  };
}

function createJwt(payload: Record<string, unknown>) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  return `${encode({ alg: 'none' })}.${encode(payload)}.signature`;
}

describe('useUserStore', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    vi.stubGlobal('window', {
      atob: (value: string) => Buffer.from(value, 'base64').toString('binary'),
      localStorage: createMemoryStorage(),
      location: { hostname: 'admin.yurexcc.com' }
    });
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    createApp({}).use(pinia);
    setActivePinia(pinia);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('stores the local login token and parses numeric user IDs', async () => {
    const token = createJwt({
      userId: 7,
      username: 'Alice',
      supplierCode: 'D',
      tenantCode: 'yurex'
    });
    mocks.login.mockResolvedValue({ token });
    const store = useUserStore();

    await store.login({ username: 'alice', password: 'password123' });
    await nextTick();

    expect(store.token).toBe(token);
    expect(store.userInfo).toMatchObject({ userId: '7', userName: 'Alice' });
    expect(store.isLoggedIn).toBe(true);
  });

  it('clears local state on logout', () => {
    const store = useUserStore();
    store.setToken(createJwt({ username: 'Alice' }));

    store.logout();

    expect(store.token).toBeUndefined();
    expect(store.loginReady).toBe(false);
  });
});
