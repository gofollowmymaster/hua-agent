import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUnauthorizedFetch, get, http } from './http';
import { AUTH_STORAGE_KEY, writeAuthState } from '@/auth/storage';

const originalAdapter = http.defaults.adapter;

describe('unauthorized requests', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/knowledge/documents?drawer=document-chunks';
    writeAuthState('header.eyJ1c2VySWQiOiIxIn0.signature');
  });

  afterEach(() => {
    http.defaults.adapter = originalAdapter;
    vi.unstubAllGlobals();
  });

  it('clears persisted auth for an ordinary HTTP 401', async () => {
    http.defaults.adapter = async () =>
      Promise.reject({ response: { status: 401 } });

    await expect(get('/protected')).rejects.toBeTruthy();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(window.location.hash).toContain('#/login?redirect=');
    expect(decodeURIComponent(window.location.hash)).toContain(
      '/knowledge/documents?drawer=document-chunks',
    );
  });

  it('clears persisted auth for a streaming fetch 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    const response = await createUnauthorizedFetch()('/stream');
    expect(response.status).toBe(401);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(window.location.hash).toContain('#/login?redirect=');
  });
});
