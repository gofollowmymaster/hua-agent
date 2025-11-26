import { Injectable, Scope } from '@nestjs/common';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { RedisKeys } from '../const/redis-key.enum';

@Injectable({ scope: Scope.TRANSIENT })
export default abstract class HttpApiHelper {
  protected readonly cacheKeytemplate: RedisKeys;
  protected readonly useCache: boolean;
  protected readonly ttl: number = 60 * 60 * 1;
  protected redis: Redis;

  constructor(
    protected redisService?: RedisService,
    cacheKeytemplate?: RedisKeys,
  ) {
    this.redis = redisService?.getClient();
    this.cacheKeytemplate = cacheKeytemplate;
  }
  buildCacheKey(key: string) {
    const cacheKey = this.redisService.buildCacheKey(
      this.cacheKeytemplate,
      '{apiName}',
      key,
    );
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
      // console.log('[ err ] >', err);
      sendExceptionToFeishu(err, 'Api 请求失败:' + requestName);
    }
  }
}
