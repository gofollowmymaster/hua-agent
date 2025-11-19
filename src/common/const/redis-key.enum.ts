export const RedisPrefix = 'frontend-node:';

export const RedisWikiPrefix = RedisPrefix + '{tenant}:wiki:';
export const RedisPrefixMtable = RedisPrefix + 'mtable:';
export const RedisPrefixLimiter = RedisPrefix + 'limiter:';
export const RedisPrefixIdempotent = RedisPrefix + 'idempotent:';

export const SentryAlertPrefix = RedisPrefix + 'alert:sentry-integration:';
export const FeishuApiPrefix = RedisPrefix + '{tenant}:feishu-api:';
export const SentryApiPrefix = RedisPrefix + 'sentry-api:';
export const AilyPrefix = RedisPrefix + '{tenant}:aily:';
export const PushFeishuDocPrefix = RedisPrefix + 'push-feishu-doc:';

export enum RedisKeys {
  WIKI_DIRECTORY = RedisWikiPrefix + 'directory:{spaceId}',
  FEISHU_MTABLE = RedisPrefixMtable + '{appToken}:{tableId}',
  FEISHU_FIXED_ACCESS_TOKEN = AilyPrefix + 'fixed-access-token:{code}',
  FEISHU_FIXED_ACCESS_TOKEN_USED = AilyPrefix + 'fixed-access-token:used',
  FEISHU_AILY_SESSION_CODE = AilyPrefix + 'session-code:{code}',
  RATE_LIMITER = RedisPrefixLimiter + '{key}',
  REDIS_IDEMPOTENT = RedisPrefixIdempotent + '{key}',
  SENTRY_ALERT_COUNT_ISSUE = SentryAlertPrefix + 'issue-error-count:{issueId}',
  SENTRY_ALERT_COUNT_FREQUENCY = SentryAlertPrefix + 'error-frequency:{module}',
  FEISHU_API_CACHE = FeishuApiPrefix + '{apiName}',
  SENTRY_API_CACHE = SentryApiPrefix + '{apiName}',
  PUSH_FEISHU_DOC_CACHE = PushFeishuDocPrefix + '{tag}',
}
