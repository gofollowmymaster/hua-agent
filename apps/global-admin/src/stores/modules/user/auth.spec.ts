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

vi.mock('@aplus-frontend/aplus-auth-sdk', () => ({ authHub: mocks.authHub }));

describe('global admin auth', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_AUTH_ENV', 'test');
    vi.stubEnv('VITE_AUTH_API_URL', 'https://auth-api.test.example.com');
    vi.stubEnv('VITE_AUTH_APP_CODE', 'GLOBAL');
    vi.stubGlobal('alert', vi.fn());
    mocks.client.getAuthToken.mockResolvedValue('');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses GLOBAL without adding supplierCode to login parameters', async () => {
    const auth = await import('./auth');
    await auth.ensureLogin();

    const redirectParams = { locale: 'zh_CN', appCode: 'GLOBAL' };
    expect(mocks.authHub).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'global-admin',
        apiUrl: 'https://auth-api.test.example.com',
        customRedirectUrls: expect.objectContaining({
          test: 'http://auth.test-com.elnkpro.com/console.html'
        }),
        redirectLoginExtraParams: redirectParams
      })
    );
    expect(mocks.client.redirectLogin).toHaveBeenCalledWith(redirectParams);
    expect(redirectParams).not.toHaveProperty('supplierCode');
  });

  it('returns the SDK token without redirecting', async () => {
    mocks.client.getAuthToken.mockResolvedValue('sdk-token');
    const auth = await import('./auth');

    await expect(auth.ensureLogin()).resolves.toBe('sdk-token');
    expect(mocks.client.redirectLogin).not.toHaveBeenCalled();
  });

  it('reports a missing auth API URL before creating the SDK client', async () => {
    vi.stubEnv('VITE_AUTH_API_URL', '');
    const auth = await import('./auth');

    await expect(auth.ensureLogin()).rejects.toThrow('VITE_AUTH_API_URL');
    expect(mocks.authHub).not.toHaveBeenCalled();
  });
});
