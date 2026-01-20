import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { RedisKeys } from '../const/redis-key.enum';

// @Injectable({ scope: Scope.TRANSIENT })
export default abstract class HttpApiHelper {
  protected readonly cacheKeyTemplate: RedisKeys;
  protected readonly useCache: boolean;
  protected readonly ttl: number = 60 * 60 * 1;
  protected redis: Redis;

  constructor(
    protected redisService?: RedisService,
    cacheKeyTemplate?: RedisKeys,
  ) {
    this.redis = redisService?.getClient();
    this.cacheKeyTemplate = cacheKeyTemplate;
  }
  buildCacheKey(key: string) {
    const cacheKey = this.redisService.buildCacheKey(
      this.cacheKeyTemplate,
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
  async requestWrapper(handler: () => Promise<any>, requestName: string) {
    try {
      const data = await handler();

      return data;
    } catch (err) {
      sendExceptionToFeishu(err, 'Api 请求失败:' + requestName);
    }
  }
}
