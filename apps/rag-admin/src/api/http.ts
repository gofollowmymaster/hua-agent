import axios from 'axios';
import { getToken } from '@/stores/modules/user/token';
import { useUserStore } from '@/stores/modules/user';

interface ApiResponse<T> {
  code: number;
  body: T;
  message: string;
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
});

http.interceptors.request.use((config) => {
  const userStore = useUserStore();
  const token = userStore.token || getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>;
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 401) {
        useUserStore().logout();
      }
      if (data.code !== 200) {
        return Promise.reject(new Error(data.message || '请求失败'));
      }
      return data.body;
    }

    return response.data;
  },
  (error) => {
    if (error?.response?.status === 401) {
      useUserStore().logout();
    }
    return Promise.reject(error);
  },
);

export function post<T>(url: string, data?: unknown) {
  return http.post<unknown, T>(url, data);
}

export function get<T>(url: string) {
  return http.get<unknown, T>(url);
}

export function del<T>(url: string) {
  return http.delete<unknown, T>(url);
}

export function getBlob(url: string) {
  return http.get<unknown, Blob>(url, { responseType: 'blob' });
}
