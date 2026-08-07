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
    client,
    getToken: vi.fn(),
    setToken: vi.fn()
  };
});

vi.mock('@aplus-frontend/aplus-auth-sdk', () => ({
  authHub: mocks.authHub
}));

vi.mock('./token', () => ({
  getToken: mocks.getToken,
  setToken: mocks.setToken
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
    mocks.getToken.mockReturnValue(undefined);
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

    expect(mocks.setToken).toHaveBeenCalledWith(undefined);
    expect(mocks.client.redirectLogin).toHaveBeenNthCalledWith(
      2,
      redirectParams
    );
  });
});
