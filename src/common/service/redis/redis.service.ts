import { Inject, Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  getClient(): Redis {
    return this.redis;
  }

  /**
   * 检查是否超过限流阈值
   * @param key 限流的唯一标识
   * @param limit 限流次数
   * @param ttl 时间窗口（单位：秒）
   * @returns 是否允许通过
   */
  async limiter(key: string, limit: number, ttl: number): Promise<boolean> {
    const redisKey = RedisKeys.RATE_LIMITER.replace('{key}', key);
    const current = await this.redis.incr(redisKey);

    if (current === 1) {
      // 设置过期时间
      this.redis.expire(redisKey, ttl);
    }

    return current > limit;
  }
  /**
   * 时间范围内调用频率
   * @param key 限流的唯一标识
   * @param limit 限流次数
   * @param ttl 时间窗口（单位：秒）
   * @returns 是否允许通过
   */
  async fre(key: string, limit: number, ttl: number): Promise<boolean> {
    const redisKey = RedisKeys.RATE_LIMITER.replace('{key}', key);
    const current = await this.redis.incr(redisKey);

    if (current === 1) {
      // 设置过期时间
      this.redis.expire(redisKey, ttl);
    }

    return current > limit;
  }
}
