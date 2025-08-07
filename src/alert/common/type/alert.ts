import { SentryUser } from './sentry';

export type AlertEvent = {
  requestData?: RequestData;
  pageModuleName?: PageModuleName;
  serverModuleName?: string;
  timestamp: number;
  environment: Environment;
  issueId: string;
  title: string;
  level: ErrorLevel;
  webUrl: string;
  culprit: string;
  type: string;
  errorEndpoint: ErrorEndpoint;
  feishuUrl?: string;
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

export enum IssueAction {
  Created = 'created',
  Resolved = 'resolved',
  Assigned = 'assigned',
  Archived = 'archived',
  Unresolved = 'unresolved',
}
export enum AlertAction {
  Triggered = 'triggered',
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

export type CommentEvent = {
  operator: string;
  issueId: string;
  comment: string;
};

export type IssueEvent = {
  action: IssueAction;
  issueId: string;
  // substatus: params.data.issue.substatus;
  status: 'resolved' | 'unresolved' | 'ignored';
  // statusDetails: params.data.issue.statusDetails;
  culprit: string;
  assignedTo: SentryUser;
  issueType: 'error';
  level: ErrorLevel;
  type: string;
  operator?: SentryUser;
  // assignee: {
  //   type: 'user';
  //   name: 'Ahua';
  //   id: 10;
  //   email: 'ahua@aplnk.com';
  // };
};

export type AssignEvent = {
  operator: string;
  issueId: string;
  assignTo: string;
};

export type ModifyStatusEvent = {
  operator: string;
  issueId: string;
  issueStatus: 'resolved' | 'unresolved' | 'ignored';
};

export type CloseIssueEvent = {
  operator: string;
  issueId: string;
  reason: string;
  solution: string;
};
