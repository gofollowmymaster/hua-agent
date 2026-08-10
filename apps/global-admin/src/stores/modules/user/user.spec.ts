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
  logout: mocks.logout
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

  it('parses user info from the JWT payload', () => {
    const store = useUserStore();

    store.setToken(
      createJwt({
        userId: 'u-1',
        userName: 'Alice',
        email: 'alice@example.com'
      })
    );

    expect(store.userInfo).toMatchObject({
      userId: 'u-1',
      userName: 'Alice',
      email: 'alice@example.com'
    });
    expect(store.isLoggedIn).toBe(true);
    expect(store.displayName).toBe('Alice');
  });

  it('persists token and userInfo under authToken', async () => {
    const token = createJwt({
      userId: 'u-1',
      userName: 'Alice'
    });
    const store = useUserStore();

    store.setToken(token);
    await nextTick();

    expect(JSON.parse(storage.getItem('authToken')!)).toMatchObject({
      token,
      userInfo: {
        userId: 'u-1',
        userName: 'Alice'
      }
    });
  });

  it('restores loginReady and user info from persisted authToken', () => {
    const token = createJwt({
      userId: 'u-1',
      userName: 'Alice'
    });
    storage.setItem('authToken', JSON.stringify({ token }));

    const store = useUserStore();

    expect(store.token).toBe(token);
    expect(store.loginReady).toBe(true);
    expect(store.userInfo.userName).toBe('Alice');
  });

  it('clears persisted token on logout', async () => {
    const store = useUserStore();
    store.setToken(createJwt({ userName: 'Alice' }));

    store.logout();
    await nextTick();

    expect(JSON.parse(storage.getItem('authToken')!)).not.toHaveProperty(
      'token'
    );
    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it('merges SDK user info without clearing JWT fields', async () => {
    const token = createJwt({
      userId: 'u-1',
      userName: 'Alice'
    });
    mocks.ensureLogin.mockResolvedValue(token);
    mocks.getCurrentUserInfo.mockResolvedValue({ email: 'alice@example.com' });
    const store = useUserStore();

    await store.ensureLogin();

    expect(store.token).toBe(token);
    expect(store.userInfo.userId).toBe('u-1');
    expect(store.userInfo.userName).toBe('Alice');
    expect(store.userInfo.email).toBe('alice@example.com');
  });
});
