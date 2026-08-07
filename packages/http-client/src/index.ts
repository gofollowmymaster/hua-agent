import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';

export interface ApiResponse<Body> {
  code: number;
  body: Body;
  message: string;
}

export interface CreateHttpClientOptions {
  baseURL?: string;
  timeout?: number;
  getAccessToken?: () => string | undefined;
  onUnauthorized?: () => void | Promise<void>;
}

export interface HttpClient {
  http: AxiosInstance;
  get<Response>(url: string, config?: AxiosRequestConfig): Promise<Response>;
  post<Response>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<Response>;
  del<Response>(url: string, config?: AxiosRequestConfig): Promise<Response>;
  getBlob(url: string, config?: AxiosRequestConfig): Promise<Blob>;
}

function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    typeof data.code === 'number'
  );
}

/**
 * 创建与具体前端应用解耦的 axios client，并统一处理 token、业务 envelope 和未授权响应。
 */
export function createHttpClient(options: CreateHttpClientOptions): HttpClient {
  const defaults: CreateAxiosDefaults = {
    baseURL: options.baseURL,
    timeout: options.timeout ?? 60000,
  };
  const http = axios.create(defaults);

  const handleUnauthorized = () => {
    if (options.onUnauthorized) {
      void options.onUnauthorized();
    }
  };

  http.interceptors.request.use((config) => {
    const token = options.getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  http.interceptors.response.use(
    (response): any => {
      const data = response.data as unknown;
      if (!isApiResponse(data)) {
        return data;
      }
      if (data.code === 401) {
        handleUnauthorized();
      }
      if (data.code !== 200) {
        return Promise.reject(new Error(data.message || '请求失败'));
      }
      return data.body;
    },
    (error) => {
      if (error?.response?.status === 401) {
        handleUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return {
    http,
    get<Response>(url: string, config?: AxiosRequestConfig) {
      return http.get<unknown, Response>(url, config);
    },
    post<Response>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return http.post<unknown, Response>(url, data, config);
    },
    del<Response>(url: string, config?: AxiosRequestConfig) {
      return http.delete<unknown, Response>(url, config);
    },
    getBlob(url: string, config?: AxiosRequestConfig) {
      return http.get<unknown, Blob>(url, {
        ...config,
        responseType: 'blob',
      });
    },
  };
}
