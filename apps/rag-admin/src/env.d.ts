/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_AUTH_URL_PREFIX?: string;
  readonly VITE_AUTH_ENV?: string;
  readonly VITE_AUTH_PLATFORM?: string;
  readonly VITE_AUTH_APP_CODE?: string;
  readonly VITE_SUPPLIER_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
