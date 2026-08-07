import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../src';

function createResponse(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
) {
  return {
    config,
    data,
    headers: new AxiosHeaders(),
    status,
    statusText: status === 200 ? 'OK' : 'Error',
  };
}

describe('createHttpClient', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    onUnauthorized.mockClear();
  });

  it('uses runtime options and adds a bearer token', async () => {
    const client = createHttpClient({
      baseURL: '/api',
      timeout: 1234,
      getAccessToken: () => 'token',
      onUnauthorized,
    });
    let requestConfig: InternalAxiosRequestConfig | undefined;
    client.http.defaults.adapter = async (config) => {
      requestConfig = config;
      return createResponse(config, {
        code: 200,
        body: { ok: true },
        message: '',
      });
    };

    await expect(client.get<{ ok: boolean }>('/demo')).resolves.toEqual({
      ok: true,
    });
    expect(client.http.defaults.baseURL).toBe('/api');
    expect(client.http.defaults.timeout).toBe(1234);
    expect(requestConfig?.headers.Authorization).toBe('Bearer token');
  });

  it('does not add authorization when the token is empty', async () => {
    const client = createHttpClient({ getAccessToken: () => undefined });
    let requestConfig: InternalAxiosRequestConfig | undefined;
    client.http.defaults.adapter = async (config) => {
      requestConfig = config;
      return createResponse(config, 'raw');
    };

    await expect(client.get<string>('/demo')).resolves.toBe('raw');
    expect(requestConfig?.headers.Authorization).toBeUndefined();
  });

  it('rejects business errors and handles business 401', async () => {
    const client = createHttpClient({ onUnauthorized });
    client.http.defaults.adapter = async (config) =>
      createResponse(config, { code: 401, body: null, message: '请登录' });

    await expect(client.get('/demo')).rejects.toThrow('请登录');
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('handles HTTP 401 errors', async () => {
    const client = createHttpClient({ onUnauthorized });
    client.http.defaults.adapter = async (config) => {
      const response = createResponse(config, { message: 'Unauthorized' }, 401);
      throw new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    };

    await expect(client.get('/demo')).rejects.toThrow('Unauthorized');
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('preserves Blob requests and custom request config', async () => {
    const client = createHttpClient({});
    let requestConfig: AxiosRequestConfig | undefined;
    const blob = new Blob(['file']);
    client.http.defaults.adapter = async (config) => {
      requestConfig = config;
      return createResponse(config, blob);
    };

    await expect(client.getBlob('/file', { timeout: 999 })).resolves.toBe(blob);
    expect(requestConfig?.responseType).toBe('blob');
    expect(requestConfig?.timeout).toBe(999);
  });
});
