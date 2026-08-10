import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUnauthorizedFetch } from './unauthorized-fetch';

describe('createUnauthorizedFetch', () => {
  const logout = vi.fn();

  afterEach(() => {
    logout.mockClear();
    vi.unstubAllGlobals();
  });

  it('logs out when the response is HTTP 401', async () => {
    const response = new Response(null, { status: 401 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await createUnauthorizedFetch(logout)('/api/demo');

    expect(fetchMock).toHaveBeenCalledWith('/api/demo', undefined);
    expect(logout).toHaveBeenCalledOnce();
    expect(result).toBe(response);
  });

  it('keeps other statuses untouched', async () => {
    const response = new Response(null, { status: 500 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await createUnauthorizedFetch(logout)('/api/demo', {
      method: 'GET'
    });

    expect(logout).not.toHaveBeenCalled();
    expect(result).toBe(response);
  });
});
