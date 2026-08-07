import Cookies from 'js-cookie';

const appName = import.meta.env.VITE_AUTH_PLATFORM || 'rag-admin';
const accessTokenKey = `${appName}-auth-access-token`;

export function getToken() {
  return Cookies.get(accessTokenKey);
}

export function setToken(token?: string) {
  if (!token) {
    Cookies.remove(accessTokenKey, { path: '/' });
    return;
  }

  Cookies.set(accessTokenKey, token, { expires: 1, path: '/' });
}
