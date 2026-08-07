export type AuthEnv = 'dev' | 'development' | 'test' | 'uat' | 'prod';

const loginUrls: Readonly<Record<AuthEnv, string>> = {
  development: 'http://global.dev-v2.elnkpro.com',
  dev: 'http://global.dev-v2.elnkpro.com',
  test: 'https://global.test.elnkpro.com',
  uat: 'https://global.uat.elnkpro.com',
  prod: 'https://global.aplnk.com'
};

export function resolveAuthEnv(authEnv?: string, viteMode?: string): AuthEnv {
  const candidate = (
    authEnv?.trim() ||
    viteMode?.trim() ||
    'dev'
  ).toLowerCase();
  if (candidate === 'production') return 'prod';
  if (
    candidate === 'dev' ||
    candidate === 'development' ||
    candidate === 'test' ||
    candidate === 'uat' ||
    candidate === 'prod'
  ) {
    return candidate;
  }
  return 'dev';
}

export function resolveGlobalAuthConfig(
  authEnv?: string,
  viteMode?: string,
  apiUrl?: string
) {
  const env = resolveAuthEnv(authEnv, viteMode);
  return {
    env,
    loginUrl: loginUrls[env],
    redirectUrls: loginUrls,
    apiUrl: apiUrl?.trim() || ''
  };
}

export function requireAuthApiUrl(apiUrl: string) {
  if (!apiUrl) {
    throw new Error('缺少 VITE_AUTH_API_URL，无法连接总控台认证 API');
  }
  return apiUrl;
}
