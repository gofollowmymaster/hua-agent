import { createHttpClient } from '@aplus-sql/http-client';
import {
  currentAccessToken,
  redirectToLogin,
  writeAuthState,
} from '@/auth/storage';

export const apiBaseUrl = process.env.UMI_APP_API_BASE_URL || '';

export const { http, post, get, del, getBlob } = createHttpClient({
  baseURL: apiBaseUrl,
  timeout: 60000,
  getAccessToken: currentAccessToken,
  onUnauthorized() {
    writeAuthState(undefined);
    redirectToLogin();
  },
});

export function createUnauthorizedFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await window.fetch(input, init);
    if (response.status === 401) {
      writeAuthState(undefined);
      redirectToLogin();
    }
    return response;
  };
}
