import { resolveUserInfo, type LoginUser } from './jwt';

export const AUTH_STORAGE_KEY = 'authToken';

export interface PersistedAuthState {
  token?: string;
  userInfo: LoginUser;
}

export function readAuthState(): PersistedAuthState {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { userInfo: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedAuthState>;
    const token = typeof parsed.token === 'string' ? parsed.token : undefined;
    return {
      token,
      userInfo: token ? resolveUserInfo(token) : {},
    };
  } catch {
    return { userInfo: {} };
  }
}

export function writeAuthState(token?: string) {
  if (!token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { userInfo: {} } satisfies PersistedAuthState;
  }
  const state: PersistedAuthState = { token, userInfo: resolveUserInfo(token) };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function currentAccessToken() {
  return readAuthState().token;
}

export function currentProtectedPath() {
  const hashPath = window.location.hash.replace(/^#/, '');
  return hashPath.startsWith('/') ? hashPath : '/knowledge/documents';
}

export function redirectToLogin() {
  const current = currentProtectedPath();
  const redirect = current.startsWith('/login') ? '' : current;
  window.location.hash = redirect
    ? `#/login?redirect=${encodeURIComponent(redirect)}`
    : '#/login';
}
