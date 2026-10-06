import { beforeEach, describe, expect, it } from 'vitest';
import { AUTH_STORAGE_KEY, readAuthState, writeAuthState } from './storage';

function token(payload: Record<string, unknown>) {
  const encoded = window
    .btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${encoded}.signature`;
}

describe('auth storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('writes the Pinia-compatible object shape and rehydrates JWT data', () => {
    const value = token({ userName: 'Admin', supplierCode: 'A' });
    writeAuthState(value);
    expect(
      JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}'),
    ).toMatchObject({
      token: value,
      userInfo: { userName: 'Admin', supplierCode: 'A' },
    });
    expect(readAuthState().userInfo.userName).toBe('Admin');
  });

  it('returns an empty state for malformed persisted data', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{');
    expect(readAuthState()).toEqual({ userInfo: {} });
  });
});
