import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Environment,
  ErrorEndpoint,
  ErrorLevel,
  PageModuleName,
  RequestData,
} from './alert';

class SentryEventExtra {
  @ApiPropertyOptional({
    type: Object,
    description: '接口请求数据',
  })
  __serialized__?: RequestData;
  @ApiProperty({
    enum: PageModuleName,
    description: '错误页面模块名称',
  })
  subModuleName: PageModuleName;
  @ApiProperty({
    enum: ErrorEndpoint,
    description: '错误端点类型',
  })
  errorEndpoint: ErrorEndpoint;
  [key: string]: any;
}
export class SentryEvent {
  _dsc: Dsc;
  _meta: Meta;
  _metrics: Metrics;
  _ref: number;
  _ref_version: number;
  breadcrumbs: Breadcrumbs2;
  contexts: Contexts;
  culprit: string;
  debug_meta: Debugmeta;

  environment: Environment;
  event_id: string;
  exception: Exception;
  fingerprint: string[];
  grouping_config: Groupingconfig;
  hashes: string[];
  id: string;
  key_id: string;
  level: ErrorLevel;
  location: string;
  logentry: Logentry;
  logger: string;
  metadata: Metadata;
  nodestore_insert: number;
  platform: string;
  project: number;
  received: number;
  release: string;
  request: Request;
  scraping_attempts: Scrapingattempt[];
  sdk: Sdk;
  tags: string[][];
  timestamp: number;
  title: string;
  transaction: string;
  readonly type: string;
  user: User;
  version: string;
  web_url: string;
  issue_url: string;
  issue_id: string;
  @ApiPropertyOptional({
    type: Object,
    description: '附加的sentry事件数据',
  })
  extra?: SentryEventExtra;
}

interface User {
  ip_address: string;
  sentry_user: string;
}

interface Sdk {
  integrations: string[];
  name: string;
  packages: Package[];
  version: string;
}

interface Package {
  name: string;
  version: string;
}

interface Scrapingattempt {
  status: string;
  url: string;
}

interface Request {
  fragment: string;
  headers: string[][];
  url: string;
}

interface Metadata {
  filename: string;
  function: string;
  in_app_frame_mix: string;
  type: string;
  value: string;
}

interface Logentry {
  formatted: string;
}

interface Groupingconfig {
  enhancements: string;
  id: string;
}

interface Exception {
  values: Value2[];
}

interface Value2 {
  mechanism: Mechanism;
  raw_stacktrace: Rawstacktrace;
  stacktrace: Stacktrace;
  type: string;
  value: string;
}

interface Stacktrace {
  frames: Frame2[];
}

interface Frame2 {
  abs_path: string;
  colno?: number;
  context_line?: string;
  data?: Data3;
  filename: string;
  function: string;
  in_app: boolean;
  lineno?: number;
  module?: string;
  post_context?: string[];
  pre_context?: string[];
}

interface Data3 {
  resolved_with: string;
  sourcemap: string;
  sourcemap_origin: Sourcemaporigin;
  symbolicated: boolean;
}

interface Sourcemaporigin {
  bundled: (Bundled | string)[];
}

interface Bundled {
  source_map: Sourcemap;
}

interface Sourcemap {
  abs_path: string;
  debug_id: string;
}

interface Rawstacktrace {
  frames: Frame[];
}

interface Frame {
  abs_path: string;
  colno?: number;
  context_line?: string;
  filename: string;
  function?: string;
  in_app: boolean;
  lineno?: number;
  post_context?: string[];
  pre_context?: string[];
}

interface Mechanism {
  handled: boolean;
  type: string;
}

interface Debugmeta {
  images: Image[];
}

interface Image {
  code_file: string;
  debug_id: string;
  type: string;
}

interface Contexts {
  browser: Browser;
  device: Device;
  os: Browser;
  trace: Trace;
}

interface Trace {
  client_sample_rate: number;
  span_id: string;
  status: string;
  trace_id: string;
  type: string;
}

interface Device {
  brand: string;
  family: string;
  model: string;
  type: string;
}

interface Browser {
  name: string;
  type: string;
  version: string;
}

interface Breadcrumbs2 {
  values: Value[];
}

interface Value {
  category: string;
  data: Data2;
  level: string;
  timestamp: number;
  type: string;
  message?: string;
}

interface Data2 {
  from?: string;
  to?: string;
  method?: string;
  status_code?: number;
  url?: string;
  arguments?: (Argument | string | string)[];
  logger?: string;
  __span?: string;
}

interface Argument {
  antdLocale: string;
  btrOrder: string;
  businessQuotation: string;
  common: string;
  component: string;
  layout: string;
  member: string;
  organization: string;
  product: string;
  productionList: string;
  rantmember: string;
  routes: string;
  sales: string;
  sys: string;
  vcAccount: string;
}

interface Metrics {
  'bytes.ingested.event': number;
  'bytes.stored.event': number;
}

interface Meta {
  breadcrumbs: Breadcrumbs;
}

interface Breadcrumbs {
  values: Record<string, Breadcrumb>;
}

interface Breadcrumb {
  data: Data;
}

interface Data {
  url: Url;
}

interface Url {
  '': _;
}

interface _ {
  len: number;
  rem: (number | string)[][];
}

interface Dsc {
  environment: Environment;
  public_key: string;
  release: string;
  replay_id: null;
  sample_rand: string;
  sample_rate: string;
  sampled: boolean;
  trace_id: string;
  transaction: string;
}

export type SentryComment = {
  comment_id: number;

  issue_id: number;
  project_slug: string;
  timestamp: string;
  comment: string;
};

export type SentryUser = {
  email: string;
  type?: 'user';
  id?: string;
  name: string;
  openId?: string;
};

export type SentryStatus =
  | 'resolved'
  | 'resolvedInNextRelease'
  | 'unresolved'
  | 'ignored'
  | 'unresolved';
export type IssueStatusDetails =
  | 'inRelease'
  | 'inNextRelease'
  | 'inCommit'
  | 'ignoreDuration'
  | 'ignoreCount'
  | 'ignoreWindow'
  | 'ignoreUserCount'
  | 'ignoreUserWindow';
export type IssueStatusDetailsType = {
  [key in IssueStatusDetails]?: number;
};
// | 'ignored_in_release'
// | 'ignored_in_next_release';
export type StatusDetails = {
  inRelease?: string;
  actor?: {
    id: '10';
    name: string;
    username: string;
    email: string;
    avatarUrl: 'https://gravatar.com/avatar/e940675142eb0c500c9c237c5831a583c5b6cf38a324ff1a5d39efeb1add6766?s=32&d=mm';
    isActive: true;
    hasPasswordAuth: true;
    isManaged: false;
    dateJoined: '2024-11-07T13:01:12.499186Z';
    lastLogin: '2025-08-02T04:27:54.872960Z';
    has2fa: false;
    lastActive: '2025-08-05T07:34:55.021633Z';
    isSuperuser: false;
    isStaff: false;
    emails: [
      {
        id: '10';
        email: string;
        is_verified: true;
      },
    ];
    avatar: {
      avatarType: 'letter_avatar';
      avatarUuid: null;
      avatarUrl: null;
    };
  };
};
export type SentryIssue = {
  id: string;
  shareId: null;
  shortId: string;
  title: string;
  culprit: string;
  permalink: null;
  logger: null;
  level: ErrorLevel;
  status: SentryStatus;
  statusDetails: StatusDetails;
  substatus: string;
  isPublic: false;
  platform: 'javascript';
  project: {
    id: '25';
    name: 'aplus-user';
    slug: 'aplus-user';
    platform: 'javascript-vue';
  };
  type: 'error';
  metadata: {
    value: string;
    sdk: {
      name: 'sentry.javascript.vue';
      name_normalized: 'sentry.javascript.vue';
    };
    initial_priority: number;
    title: string | null;
  };
  numComments: number;
  assignedTo: SentryUser;
  isBookmarked: boolean;
  isSubscribed: boolean;
  subscriptionDetails: null;
  hasSeen: boolean;
  annotations: [];
  issueType: 'error';
  issueCategory: 'error';
  priority: 'high';
  priorityLockedAt: null;
  isUnhandled: boolean;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  firstRelease?: Record<string, any>;
};
export type SentryHookIssue = {
  resolution_type?: 'in_next_release' | 'in_release';
  assignee?: SentryUser;
  issue: SentryIssue;
};

export type businessLine =
  | '商家运营'
  | '仓储物流'
  | '业财一体'
  | '基础架构'
  | '其他';
export type PushIssueCardToUserParams = {
  businessLine: businessLine;
  errorEndpoint: ErrorEndpoint;
  userId: string;
  period: string;
};
