// import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import FeishuApiHelper from './feishu-api-helper';

@Injectable({ scope: Scope.TRANSIENT })
abstract class FeishuDataApiHelper extends FeishuApiHelper {
  protected readonly useCache: boolean;
  protected readonly ttl: number = 60 * 60 * 1;
  @Inject(CACHE_MANAGER) protected cacheManager: Cache;
  protected redis: Redis;

  constructor(protected redisService?: RedisService) {
    super();
    this.redis = redisService.getClient();
  }
  buildCacheKey(key: string) {
    const cacheKey = RedisKeys.FEISHU_API_CACHE.replace('{apiName}', key);
    return cacheKey;
  }

  async readWrapper(key: string, handler: () => Promise<any>, useCache = true) {
    // if (!this.cacheManager) {
    //   this.cacheManager = getGlobalAppInstance(CACHE_MANAGER);
    // }
    if (this.useCache || useCache) {
      const cachaeKey = this.buildCacheKey(key);

      let res = await this.cacheManager?.get(cachaeKey);

      if (res) return res;

      res = await this.requestWrapper(handler);
      this.cacheManager.set(cachaeKey, res, this.ttl);
      return res;
    }
    return await handler();
  }
}

export default FeishuDataApiHelper;
