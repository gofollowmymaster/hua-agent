export type AuthEnv = 'dev' | 'development' | 'test' | 'uat' | 'prod';

const loginUrls: Readonly<Record<AuthEnv, string>> = {
  development: 'http://auth.dev-v2.elnkpro.com/console.html',
  dev: 'http://auth.dev-v2.elnkpro.com/console.html',
  test: 'http://auth.test-com.elnkpro.com/console.html',
  uat: 'http://auth.uat.elnkpro.com/console.html',
  prod: 'http://auth.elnkpro.com/console.html'
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
    alert('缺少 VITE_AUTH_API_URL，无法连接总控台认证 API');
    throw new Error('缺少 VITE_AUTH_API_URL，无法连接总控台认证 API');
  }
  return apiUrl;
}
