import { BaseAlertEvent, ErrorLevel } from '@src/common/base/interface';
import { SentryStatus, SentryUser } from './sentry-issue';

export class AlertEvent extends BaseAlertEvent {
  pageModuleName: string;
  serverModuleName: string;
  environment: Environment;
  webUrl: string;
  errorEndpoint: ErrorEndpoint;
}

export class PageAlertEvent extends AlertEvent {
  errorEndpoint: ErrorEndpoint.Page;
}

export class RequestAlertEvent extends AlertEvent {
  requestData: RequestData;
  errorEndpoint: ErrorEndpoint.Server;
}

export enum Environment {
  PROD = 'prod',
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

  code: number | string;
  payload: string;
  resData: {
    path: string;
    status: number;
    error: string;
    message?: null;
    traceId?: string;
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
  status: SentryStatus;
  // statusDetails: params.data.issue.statusDetails;
  culprit: string;
  assignedTo: SentryUser;
  issueType: 'error';
  level: ErrorLevel;
  type: string;
  operator?: SentryUser;
};

export type AssignEvent = {
  operator: string;
  issueId: string;
  assignTo: string;
};

export type ModifyStatusEvent = {
  operator: string;
  issueId: string;
  issueStatus: SentryStatus;
};

export type CloseIssueEvent = {
  operator: string;
  issueId: string;
  reason: string;
  solution: string;
};

export type IssueInCache = {
  issueId: string;
  count: number;
  messageId: string;
  cardData: string;
  errorEndpoint: ErrorEndpoint;
};
