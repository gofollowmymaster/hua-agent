import { Injectable, Scope } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import FeishuApiHelper from './feishu-api-helper';

@Injectable({ scope: Scope.TRANSIENT })
abstract class FeishuDataApiHelper extends FeishuApiHelper {
  protected readonly useCache: boolean;
  protected readonly ttl: number = 60 * 60 * 1;
  protected redis: Redis;

  constructor(protected redisService?: RedisService) {
    super();
    this.redis = redisService.getClient();
  }
  buildCacheKey(key: string) {
    const cacheKey = this.redisService.buildCacheKey(
      RedisKeys.FEISHU_API_CACHE,
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
      const cacheKey = this.buildCacheKey(key);

      let res = await this.redis?.get(cacheKey);

      if (res) return JSON.parse(res);

      res = await this.requestWrapper(handler, key.split(':')[0]);
      this.redis.setex(cacheKey, this.ttl, JSON.stringify(res));
      return res;
    }
    return await this.requestWrapper(handler, key.split(':')[0]);
  }
}

export default FeishuDataApiHelper;
