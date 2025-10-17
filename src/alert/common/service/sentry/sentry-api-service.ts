import { Injectable, Scope } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable({ scope: Scope.TRANSIENT })
export default abstract class SentryApiHelper {
  protected readonly useCache: boolean;
  protected readonly ttl: number = 60 * 60 * 1;
  protected redis: Redis;

  constructor(protected redisService?: RedisService) {
    this.redis = redisService?.getClient();
  }
  buildCacheKey(key: string) {
    const cacheKey = RedisKeys.SENTRY_API_CACHE.replace('{apiName}', key);
    return cacheKey;
  }

  async readWrapper(
    handler: () => Promise<any>,
    useCache = true,
    key: string = '',
  ) {
    if (this.useCache && useCache) {
      const cachaeKey = this.buildCacheKey(key);

      let res = await this.redis?.get(cachaeKey);

      if (res) return JSON.parse(res);

      res = await this.requestWrapper(handler, key.split(':')[0]);
      this.redis.setex(cachaeKey, this.ttl, JSON.stringify(res));
      return res;
    }
    return await this.requestWrapper(handler, key.split(':')[0]);
  }
  async requestWrapper(handler: () => Promise<any>, requestName: string) {
    try {
      const data = await handler();

      return data;
    } catch (err) {
      sendExceptionToFeishu(err, 'Sentry Api 请求失败:' + requestName);
    }
  }
}
