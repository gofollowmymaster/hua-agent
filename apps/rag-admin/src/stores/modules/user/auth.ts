import { authHub, type authClass } from '@aplus-frontend/aplus-auth-sdk';
import { resolveAuthEnv, resolveTenantAuthConfig } from './tenant-auth.config';
import { getToken, setToken } from './token';

let authClient: authClass | undefined;

const authEnv = resolveAuthEnv(
  import.meta.env.VITE_AUTH_ENV,
  import.meta.env.MODE
);
const tenantAuthConfig = resolveTenantAuthConfig(
  window.location.hostname,
  authEnv
);

function getAuthAppCode() {
  return import.meta.env.VITE_AUTH_APP_CODE || 'ADMIN';
}

function getAuthUrlPrefix() {
  return import.meta.env.VITE_AUTH_URL_PREFIX || '';
}

function getRedirectLoginParams() {
  return {
    locale: 'zh_CN',
    supplierCode: tenantAuthConfig.supplierCode,
    appCode: getAuthAppCode()
  };
}

function createAuthClient() {
  if (authClient) return authClient;

  authClient = authHub({
    platform: import.meta.env.VITE_AUTH_PLATFORM || 'rag-admin',
    used: 'site',
    env: authEnv,
    debug: authEnv !== 'prod',
    apiUrl: tenantAuthConfig.apiUrl,
    urlPrefix: getAuthUrlPrefix(),
    customRedirectUrls: tenantAuthConfig.redirectUrls,
    redirectLoginExtraParams: getRedirectLoginParams()
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

  client.redirectLogin(getRedirectLoginParams());
  return undefined;
}

export async function getCurrentUserInfo() {
  return createAuthClient().getUserInfo();
}

export function logout() {
  setToken(undefined);
  createAuthClient().redirectLogin(getRedirectLoginParams());
}
