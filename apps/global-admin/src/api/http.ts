import { createHttpClient } from '@aplus-sql/http-client';
import { useUserStore } from '@/stores/modules/user';

export const { http, post, get, del, getBlob } = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  getAccessToken() {
    return useUserStore().token;
  },
  onUnauthorized() {
    useUserStore().logout();
  }
});
