import { authHub, type authClass } from '@aplus-frontend/aplus-auth-sdk';
import { resolveAuthEnv, resolveTenantAuthConfig } from './tenant-auth.config';

let authClient: authClass | undefined;
let redirecting = false;

const authEnv = resolveAuthEnv(
  import.meta.env.VITE_AUTH_ENV,
  import.meta.env.MODE
);
export const tenantAuthConfig = resolveTenantAuthConfig(
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

function redirectToLogin() {
  if (redirecting) return;
  redirecting = true;
  void createAuthClient().redirectLogin(getRedirectLoginParams());
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
  const client = createAuthClient();
  const token = await client.getAuthToken();
  if (!token) redirectToLogin();
  return token;
}

export async function getCurrentUserInfo() {
  return createAuthClient().getUserInfo();
}

export function logout() {
  redirectToLogin();
}
