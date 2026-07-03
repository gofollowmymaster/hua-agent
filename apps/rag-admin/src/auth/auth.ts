import { authHub, type authClass } from '@aplus-frontend/aplus-auth-sdk';
import { getToken, setToken } from './token';

let authClient: authClass | undefined;

function getAuthEnv() {
  return import.meta.env.VITE_AUTH_ENV || import.meta.env.MODE || 'dev';
}

function getApiBaseUrl() {
  return import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || '';
}

function getAuthUrlPrefix() {
  return import.meta.env.VITE_AUTH_URL_PREFIX || '';
}

export async function ensureLogin() {
  const existingToken = getToken();
  if (existingToken) return existingToken;

  authClient = authHub({
    platform: import.meta.env.VITE_AUTH_PLATFORM || 'rag-admin',
    used: 'site',
    env: getAuthEnv(),
    debug: getAuthEnv() !== 'prod',
    apiUrl: getApiBaseUrl(),
    urlPrefix: getAuthUrlPrefix(),
    redirectLoginExtraParams: {
      locale: 'zh_CN',
      supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
      appCode: import.meta.env.VITE_AUTH_APP_CODE || 'rag-admin',
    },
  });
  authClient.init();

  const token = await authClient.getAuthToken();
  if (token) {
    setToken(token);
    return token;
  }

  authClient.redirectLogin({
    locale: 'zh_CN',
    supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
    appCode: import.meta.env.VITE_AUTH_APP_CODE || 'rag-admin',
  });
  return undefined;
}

export function logout() {
  setToken(undefined);
  authClient?.redirectLogin({
    locale: 'zh_CN',
    supplierCode: import.meta.env.VITE_SUPPLIER_CODE || 'aplus',
    appCode: import.meta.env.VITE_AUTH_APP_CODE || 'rag-admin',
  });
}
