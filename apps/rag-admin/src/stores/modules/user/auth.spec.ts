import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const client = {
    init: vi.fn(),
    getAuthToken: vi.fn(),
    getUserInfo: vi.fn(),
    redirectLogin: vi.fn()
  };

  return {
    authHub: vi.fn(() => client),
    client
  };
});

vi.mock('@aplus-frontend/aplus-auth-sdk', () => ({
  authHub: mocks.authHub
}));

describe('tenant-aware auth redirects', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_AUTH_ENV', 'test');
    vi.stubEnv('VITE_AUTH_APP_CODE', 'ADMIN');
    vi.stubGlobal('window', {
      location: { hostname: 'admin.yurexcc.com' }
    });
    mocks.client.getAuthToken.mockResolvedValue('');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses the resolved tenant for SDK initialization, login, and logout', async () => {
    const auth = await import('./auth');
    const redirectParams = {
      locale: 'zh_CN',
      supplierCode: 'D',
      appCode: 'ADMIN'
    };

    await auth.ensureLogin();

    expect(mocks.authHub).toHaveBeenCalledWith(
      expect.objectContaining({
        env: 'test',
        apiUrl: 'https://api.test-com.elnkpro.com',
        customRedirectUrls: expect.objectContaining({
          test: 'https://auth.test.yurexcc.com/admin.html#/'
        }),
        redirectLoginExtraParams: redirectParams
      })
    );
    expect(mocks.client.init).toHaveBeenCalledOnce();
    expect(mocks.client.redirectLogin).toHaveBeenNthCalledWith(
      1,
      redirectParams
    );

    auth.logout();

    expect(mocks.client.redirectLogin).toHaveBeenNthCalledWith(
      2,
      redirectParams
    );
  });

  it('returns the SDK token without redirecting', async () => {
    mocks.client.getAuthToken.mockResolvedValue('sdk-token');
    const auth = await import('./auth');

    await expect(auth.ensureLogin()).resolves.toBe('sdk-token');
    expect(mocks.client.redirectLogin).not.toHaveBeenCalled();
  });

  it('uses the current origin for the development auth environment', async () => {
    vi.stubEnv('VITE_AUTH_ENV', 'development');

    const auth = await import('./auth');
    await auth.ensureLogin();

    expect(mocks.authHub).toHaveBeenCalledWith(
      expect.objectContaining({
        env: 'development',
        apiUrl: ''
      })
    );
  });
});
