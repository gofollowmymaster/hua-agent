import { describe, expect, it, vi } from 'vitest';
import { prepareGlobalAdminRoute } from './route-auth';

describe('global admin route auth', () => {
  it('allows the layout to render an authentication configuration error', async () => {
    const setLoginError = vi.fn();

    await expect(
      prepareGlobalAdminRoute({
        ensureLogin: vi
          .fn()
          .mockRejectedValue(new Error('缺少 VITE_AUTH_API_URL')),
        setLoginError,
        logout: vi.fn()
      })
    ).resolves.toBe(true);

    expect(setLoginError).toHaveBeenCalledWith('缺少 VITE_AUTH_API_URL');
  });

  it('allows navigation after successful authentication', async () => {
    const setLoginError = vi.fn();
    const logout = vi.fn();

    await expect(
      prepareGlobalAdminRoute({
        ensureLogin: vi.fn().mockResolvedValue('token'),
        setLoginError,
        logout
      })
    ).resolves.toBe(true);

    expect(logout).not.toHaveBeenCalled();
    expect(setLoginError).not.toHaveBeenCalled();
  });

  it('logs out and blocks navigation without a token', async () => {
    const logout = vi.fn();

    await expect(
      prepareGlobalAdminRoute({
        ensureLogin: vi.fn().mockResolvedValue(''),
        setLoginError: vi.fn(),
        logout
      })
    ).resolves.toBe(false);

    expect(logout).toHaveBeenCalledOnce();
  });
});
