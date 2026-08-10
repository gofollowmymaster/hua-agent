import { describe, expect, it, vi } from 'vitest';
import { prepareRagAdminRoute } from './route-auth';

describe('rag admin route auth', () => {
  it('allows navigation when a token exists', async () => {
    const logout = vi.fn();
    const setLoginError = vi.fn();

    await expect(
      prepareRagAdminRoute({
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
      prepareRagAdminRoute({
        ensureLogin: vi.fn().mockResolvedValue(''),
        setLoginError: vi.fn(),
        logout
      })
    ).resolves.toBe(false);

    expect(logout).toHaveBeenCalledOnce();
  });

  it('sets a login error and blocks navigation on auth failure', async () => {
    const setLoginError = vi.fn();

    await expect(
      prepareRagAdminRoute({
        ensureLogin: vi
          .fn()
          .mockRejectedValue(new Error('缺少 VITE_AUTH_API_URL')),
        setLoginError,
        logout: vi.fn()
      })
    ).resolves.toBe(false);

    expect(setLoginError).toHaveBeenCalledWith('缺少 VITE_AUTH_API_URL');
  });
});
