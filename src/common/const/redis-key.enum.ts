export const RedisPrefix = 'frontend-node:';
export const RedisPrefixMtable = 'frontend-node:mtable:';
export enum RedisKeys {
  WIKI_DIRECTORY = RedisPrefix + 'wiki:directory:{spaceId}',
  FEISHU_MTABLE = RedisPrefixMtable + '{appToken}:{tableId}',
  FEISHU_FIXED_ACCESS_TOKEN = RedisPrefix + 'fixed-access-token',
}
