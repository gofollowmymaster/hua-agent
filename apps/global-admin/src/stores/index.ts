import type { App } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const authTokenKey = 'authToken';
const legacyAccessTokenCookie = 'global-admin-auth-access-token';

function readCookie(name: string) {
  const cookies = window.document?.cookie ?? '';
  const prefix = `${name}=`;
  const row = cookies.split('; ').find((item) => item.startsWith(prefix));
  if (!row) return undefined;

  const value = row.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function removeCookie(name: string) {
  window.document.cookie = `${name}=; Max-Age=0; path=/`;
}

function migrateLegacyToken() {
  if (typeof window === 'undefined') return;

  const token = readCookie(legacyAccessTokenCookie);
  if (!token) return;

  if (!window.localStorage.getItem(authTokenKey)) {
    window.localStorage.setItem(authTokenKey, JSON.stringify({ token }));
  }
  removeCookie(legacyAccessTokenCookie);
}

export const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export function setupStore(app: App) {
  migrateLegacyToken();
  app.use(pinia);
}
