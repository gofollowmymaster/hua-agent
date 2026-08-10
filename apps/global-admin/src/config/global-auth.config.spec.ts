import { describe, expect, it, vi } from 'vitest';
import {
  requireAuthApiUrl,
  resolveAuthEnv,
  resolveGlobalAuthConfig
} from './global-auth.config';

describe('global auth config', () => {
  it('normalizes production and prefers the explicit auth environment', () => {
    expect(resolveAuthEnv(undefined, 'production')).toBe('prod');
    expect(resolveAuthEnv('uat', 'production')).toBe('uat');
  });

  it('maps every environment to the dedicated global login origin', () => {
    expect(resolveGlobalAuthConfig('development').loginUrl).toBe(
      'http://auth.dev-v2.elnkpro.com/console.html'
    );
    expect(resolveGlobalAuthConfig('test').loginUrl).toBe(
      'http://auth.test-com.elnkpro.com/console.html'
    );
    expect(resolveGlobalAuthConfig('uat').loginUrl).toBe(
      'http://auth.uat.elnkpro.com/console.html'
    );
    expect(resolveGlobalAuthConfig('prod').loginUrl).toBe(
      'http://auth.elnkpro.com/console.html'
    );
  });

  it('requires an explicit auth API URL', () => {
    vi.stubGlobal('alert', vi.fn());
    expect(() => requireAuthApiUrl('')).toThrow('VITE_AUTH_API_URL');
    vi.unstubAllGlobals();
    expect(requireAuthApiUrl('https://auth-api.example.com')).toBe(
      'https://auth-api.example.com'
    );
  });
});
