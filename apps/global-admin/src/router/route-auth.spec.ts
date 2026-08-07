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
        setLoginError
      })
    ).resolves.toBeUndefined();

    expect(setLoginError).toHaveBeenCalledWith('缺少 VITE_AUTH_API_URL');
  });

  it('does not set an error after successful authentication', async () => {
    const setLoginError = vi.fn();

    await prepareGlobalAdminRoute({
      ensureLogin: vi.fn().mockResolvedValue('token'),
      setLoginError
    });

    expect(setLoginError).not.toHaveBeenCalled();
  });
});
