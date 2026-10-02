export const RedisPrefix = 'frontend-node:';
export const RedisPrefixMtable = RedisPrefix + 'mtable:';
const RedisPrefixLimiter = RedisPrefix + 'limiter:';
const RedisPrefixIdempotent = RedisPrefix + 'idempotent:';

const FeishuApiPrefix = RedisPrefix + '{tenant}:feishu-api:';
const RagPrefix = RedisPrefix + '{tenant}:rag:';

export enum RedisKeys {
  FEISHU_MTABLE = RedisPrefixMtable + '{appToken}:{tableId}',
  RATE_LIMITER = RedisPrefixLimiter + '{key}',
  REDIS_IDEMPOTENT = RedisPrefixIdempotent + '{key}',
  FEISHU_API_CACHE = FeishuApiPrefix + '{apiName}',
  RAG_SESSION_MEMORY = RagPrefix + 'memory:{channel}:{sessionKey}',
}
