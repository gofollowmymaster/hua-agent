import type { App } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface MemoryStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

interface MemoryCookieStore {
  cookie: string;
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

function createMemoryCookieStore(): MemoryCookieStore {
  const data = new Map<string, string>();
  return {
    get cookie() {
      return Array.from(data.entries())
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join('; ');
    },
    set cookie(value: string) {
      const [pair, ...attributes] = value.split('; ');
      const [name, rawValue] = pair.split('=');
      if (attributes.includes('Max-Age=0')) {
        data.delete(name);
      } else {
        data.set(name, decodeURIComponent(rawValue || ''));
      }
    }
  };
}

describe('setupStore legacy token migration', () => {
  let storage: MemoryStorage;
  let document: MemoryCookieStore;

  beforeEach(() => {
    vi.resetModules();
    storage = createMemoryStorage();
    document = createMemoryCookieStore();
    vi.stubGlobal('window', {
      localStorage: storage,
      document
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('migrates the legacy cookie into authToken once', async () => {
    document.cookie = 'global-admin-auth-access-token=old-token; path=/';
    const { setupStore } = await import('./index');
    const app = { use: vi.fn() };

    setupStore(app as unknown as App);

    expect(storage.getItem('authToken')).toBe(
      JSON.stringify({ token: 'old-token' })
    );
    expect(document.cookie).toBe('');
  });

  it('keeps an existing authToken and still cleans the legacy cookie', async () => {
    storage.setItem('authToken', JSON.stringify({ token: 'new-token' }));
    document.cookie = 'global-admin-auth-access-token=old-token; path=/';
    const { setupStore } = await import('./index');
    const app = { use: vi.fn() };

    setupStore(app as unknown as App);

    expect(storage.getItem('authToken')).toBe(
      JSON.stringify({ token: 'new-token' })
    );
    expect(document.cookie).toBe('');
  });
});
