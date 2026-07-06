import { authHub, type authClass } from '@aplus-frontend/aplus-auth-sdk';
import { getToken, setToken } from './token';

let authClient: authClass | undefined;

type AuthEnv = 'dev' | 'development' | 'test' | 'uat' | 'prod';

function getAuthAppCode() {
  return import.meta.env.VITE_AUTH_APP_CODE || 'ADMIN';
}

function getAuthEnv(): AuthEnv {
  const authEnv =
    import.meta.env.VITE_AUTH_ENV || import.meta.env.MODE || 'dev';
  if (
    authEnv === 'dev' ||
    authEnv === 'development' ||
    authEnv === 'test' ||
    authEnv === 'uat' ||
    authEnv === 'prod'
  ) {
    return authEnv;
  }

  return 'dev';
}

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || ''
  );
}

function getAuthUrlPrefix() {
  return import.meta.env.VITE_AUTH_URL_PREFIX || '';
}

function createAuthClient() {
  if (authClient) return authClient;

  authClient = authHub({
    platform: import.meta.env.VITE_AUTH_PLATFORM || 'rag-admin',
    used: 'site',
    env: getAuthEnv(),
    debug: getAuthEnv() !== 'prod',
    apiUrl: getApiBaseUrl(),
    urlPrefix: getAuthUrlPrefix(),
    customRedirectUrls: {
      development: 'http://auth.dev-v2.clouboat.com/admin.html#/',
      dev: 'http://auth.dev-v2.clouboat.com/admin.html#/',
      test: 'https://auth.test-com.elnkpro.com/admin.html#/',
      uat: 'https://auth.uat-cb.clouboat.com/admin.html#/',
      prod: 'https://auth.clouboat.com/admin.html#/',
    },
    redirectLoginExtraParams: {
      locale: 'zh_CN',
      supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
      appCode: getAuthAppCode(),
    },
  });
  authClient.init();
  return authClient;
}

export async function ensureLogin() {
  const existingToken = getToken();
  if (existingToken) return existingToken;

  const client = createAuthClient();

  const token = await client.getAuthToken();
  if (token) {
    setToken(token);
    return token;
  }

  client.redirectLogin({
    locale: 'zh_CN',
    supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
    appCode: getAuthAppCode(),
  });
  return undefined;
}

export async function getCurrentUserInfo() {
  return createAuthClient().getUserInfo();
}

export function logout() {
  setToken(undefined);
  createAuthClient().redirectLogin({
    locale: 'zh_CN',
    supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
    appCode: getAuthAppCode(),
  });
}
