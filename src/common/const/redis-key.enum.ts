export const RedisPrefix = 'frontend-node:';
export const RedisPrefixMtable = 'frontend-node:mtable:';
export const RedisPrefixLimiter = 'frontend-node:limiter:';
export const SentryAlertPrefix = 'frontend-node:alert:sentry-integration:';
export const FeishuApiPrefix = 'frontend-node:feishu-api:';
export const AilyPrefix = 'frontend-node:aily:';

export enum RedisKeys {
  WIKI_DIRECTORY = RedisPrefix + 'wiki:directory:{spaceId}',
  FEISHU_MTABLE = RedisPrefixMtable + '{appToken}:{tableId}',
  FEISHU_FIXED_ACCESS_TOKEN = AilyPrefix + 'fixed-access-token:{code}',
  FEISHU_FIXED_ACCESS_TOKEN_USED = AilyPrefix + 'fixed-access-token:used',
  FEISHU_AILY_SESSION_CODE = AilyPrefix + 'session-code:{code}',
  RATE_LIMITER = RedisPrefixLimiter + '{key}',
  SENTRY_ALERT_COUNT_ISSUE = SentryAlertPrefix + 'issue-error-count:{issueId}',
  SENTRY_ALERT_COUNT_FREQUENCY = SentryAlertPrefix + 'issue-error-frequency',
  FEISHU_API_CACHE = FeishuApiPrefix + '{apiName}',
}
