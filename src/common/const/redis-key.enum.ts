export const RedisPrefix = 'frontend-node:';
const HttpDataCachePrefix = RedisPrefix + 'HttpData:';

const RedisWikiPrefix = RedisPrefix + '{tenant}:wiki:';
export const RedisPrefixMtable = RedisPrefix + 'mtable:';
const RedisPrefixLimiter = RedisPrefix + 'limiter:';
const RedisPrefixIdempotent = RedisPrefix + 'idempotent:';

const SentryAlertPrefix = RedisPrefix + 'alert:sentry-integration:';
const FeishuApiPrefix = RedisPrefix + '{tenant}:feishu-api:';
const SentryApiPrefix = RedisPrefix + 'sentry-api:';
const AliDevopsApiPrefix = HttpDataCachePrefix + '{tenant}:ali-devops-api:';
const AilyPrefix = RedisPrefix + '{tenant}:aily:';
const FeishuUserTokenPrefix = RedisPrefix + '{tenant}:{module}:';
const PushFeishuDocPrefix = RedisPrefix + 'push-feishu-doc:';
const DevopsPrefix = RedisPrefix + 'devops:';
const RagPrefix = RedisPrefix + '{tenant}:rag:';

export enum RedisKeys {
  WIKI_DIRECTORY = RedisWikiPrefix + 'directory:{spaceId}',
  FEISHU_MTABLE = RedisPrefixMtable + '{appToken}:{tableId}',
  FEISHU_FIXED_ACCESS_TOKEN = FeishuUserTokenPrefix +
    'fixed-access-token:{code}',
  FEISHU_FIXED_ACCESS_TOKEN_USED = FeishuUserTokenPrefix +
    'fixed-access-token:used',
  FEISHU_AILY_SESSION_CODE = AilyPrefix + 'session-code:{code}',
  RATE_LIMITER = RedisPrefixLimiter + '{key}',
  REDIS_IDEMPOTENT = RedisPrefixIdempotent + '{key}',
  SENTRY_ALERT_COUNT_ISSUE = SentryAlertPrefix + 'issue-error-count:{issueId}',
  SENTRY_ALERT_COUNT_FREQUENCY = SentryAlertPrefix + 'error-frequency:{module}',
  FEISHU_API_CACHE = FeishuApiPrefix + '{apiName}',
  PUSH_FEISHU_DOC_CACHE = PushFeishuDocPrefix + '{tag}',
  ALI_DEVOPS_API_CACHE = AliDevopsApiPrefix + '{apiName}',
  SENTRY_API_CACHE = SentryApiPrefix + '{apiName}',
  DEVOPS_APP_PUBLISH_CACHE = DevopsPrefix + 'publish:{workflowTag}',
  DEVOPS_APP_PUBLISH_CARD = DevopsPrefix + 'publish-card:{id}',
  RAG_SESSION_MEMORY = RagPrefix + 'memory:{channel}:{sessionKey}',
}
