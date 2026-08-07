import { describe, expect, it } from 'vitest';
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
      'http://global.dev-v2.elnkpro.com'
    );
    expect(resolveGlobalAuthConfig('test').loginUrl).toBe(
      'https://global.test.elnkpro.com'
    );
    expect(resolveGlobalAuthConfig('uat').loginUrl).toBe(
      'https://global.uat.elnkpro.com'
    );
    expect(resolveGlobalAuthConfig('prod').loginUrl).toBe(
      'https://global.aplnk.com'
    );
  });

  it('requires an explicit auth API URL', () => {
    expect(() => requireAuthApiUrl('')).toThrow('VITE_AUTH_API_URL');
    expect(requireAuthApiUrl('https://auth-api.example.com')).toBe(
      'https://auth-api.example.com'
    );
  });
});
