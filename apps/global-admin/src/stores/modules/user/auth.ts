import { authHub, type authClass } from '@aplus-frontend/aplus-auth-sdk';
import {
  requireAuthApiUrl,
  resolveGlobalAuthConfig
} from '@/config/global-auth.config';
import { getToken, setToken } from './token';

let authClient: authClass | undefined;

const authConfig = resolveGlobalAuthConfig(
  import.meta.env.VITE_AUTH_ENV,
  import.meta.env.MODE,
  import.meta.env.VITE_AUTH_API_URL
);

function getAuthAppCode() {
  return import.meta.env.VITE_AUTH_APP_CODE || 'GLOBAL';
}

function getRedirectLoginParams() {
  return {
    locale: 'zh_CN',
    appCode: getAuthAppCode()
  };
}

function createAuthClient() {
  if (authClient) return authClient;

  authClient = authHub({
    platform: import.meta.env.VITE_AUTH_PLATFORM || 'global-admin',
    used: 'site',
    env: authConfig.env,
    debug: authConfig.env !== 'prod',
    apiUrl: requireAuthApiUrl(authConfig.apiUrl),
    urlPrefix: import.meta.env.VITE_AUTH_URL_PREFIX || '',
    customRedirectUrls: authConfig.redirectUrls,
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
