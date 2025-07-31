export type AlertEvent = {
  requestData?: RequestData;
  pageModuleName?: PageModuleName;
  serverModuleName?: string;
  timestamp: number;
  environment: Environment;
  issue_id: string;
  title: string;
  level: ErrorLevel;
  web_url: string;
  culprit: string;
  type: string;
  errorEndpoint: ErrorEndpoint;
};

export enum PageModuleName {
  APLUS_ADMIN_BMS = 'aplus-admin-bms',
  APLUS_USER_BMS = 'aplus-user-bms',
  APLUS_ADMIN_MOS = 'aplus-admin-mos',
  APLUS_USER_MOS = 'aplus-user-mos',
  APLUS_ADMIN_WMS = 'aplus-admin-wms',
  APLUS_APLUS_WMS = 'aplus-user-wms',
  APLUS_ADMIN_MAIN = 'aplus-admin-main',
  APLUS_USER_MAIN = 'aplus-user-main',
  APLUS_LOGIN = 'aplus-login-center',
  APLUS_OTHER = 'others',
}

export enum ErrorLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARING = 'waring',
  INFO = 'info',
}
export enum Environment {
  PROD = 'production',
  UAT = 'uat',
  TEST = 'test',
  DEV = 'dev',
  DEVELOPMENT = 'development',
}

export enum ErrorEndpoint {
  Page = 'page',
  Server = 'server',
  Other = 'other',
}

export type RequestData = {
  url: string;

  code: number;
  payload: string;
  resData: {
    path: string;
    status: number;
    error: string;
    message?: null;
    requestId?: string;
  };
  message: string;

  traceId?: string;
  method?: 'get' | 'post' | 'put' | 'delete';
  [key: string]: any;
};
