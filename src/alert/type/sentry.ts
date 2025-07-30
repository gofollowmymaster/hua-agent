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
  extra?: {
    subModuleName: SubAppName;
    errorEndpoint: ErrorEndpoint;
    __serialized__: {
      code: number;
      payload: string;
      resData: {
        path: string;
        requestId: string;
        status: number;
        timestamp: '2025-04-11 13:50:09';
        error: string;
        message: null;
      };
      traceId: string;
      url: string;
      message: string;
      method: 'get' | 'post' | 'put' | 'delete';
      transactionMessage: string;
    };
  };
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

export type SubAppName =
  | 'aplus-admin-bms'
  | 'aplus-user-bms'
  | 'aplus-admin-mos'
  | 'aplus-user-mos'
  | 'aplus-admin-wms'
  | 'aplus-user-wms'
  | 'aplus-admin-main'
  | 'aplus-user-main'
  | 'aplus-login-center';
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
