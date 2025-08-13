import { Inject, Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import Redis from 'ioredis';

export enum RedisValueType {
  STRING = 'string',
  HASH = 'hash',
  SET = 'set',
  ZSET = 'zset',
  LIST = 'list',
}
const redisValueTypeGetMap = {
  string: 'get',
  hash: 'hgetall',
  set: 'smembers', // 添加对 SET 类型的支持
  zset: 'zrange', // 添加对 ZSET 类型的支持
  // 添加对 LIST 类型的支持
  list: 'lrange',
};

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

  async hasByPattern(pattern: string) {
    let cursor = '0';
    do {
      const reply = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        1000,
      );
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) return true;
    } while (cursor !== '0');
    return false;
  }
  async getByPattern(
    pattern: string,
    type: RedisValueType = RedisValueType.STRING,
    batchSize = 100,
  ) {
    let cursor = '0';
    const values: Record<string, any> = {};

    do {
      // 使用 SCAN 命令查找匹配的键
      const reply = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        batchSize,
      );
      cursor = reply[0];
      const keys = reply[1];
      const method = redisValueTypeGetMap[type];
      for (const key of keys) {
        const batchValues = await this.redis[method](key);
        values[key] = batchValues;
      }
    } while (cursor !== '0');

    return values;
  }

  async delByPattern(pattern: string, batchSize = 100) {
    let cursor = '0';
    let deletedCount = 0;
    //通过长度限制批量删除过多
    if (pattern.length < 20) {
      throw new Error('pattern must be greater than 10');
    }
    do {
      // 使用 SCAN 命令查找匹配的键
      const reply = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        batchSize,
      );
      cursor = reply[0];
      const keys = reply[1];

      if (keys.length > 0) {
        const count = await this.redis.del(...keys);
        deletedCount += count;
        console.log(`Deleted ${count} keys in this batch`);
      }
    } while (cursor !== '0');

    console.log(`Total deleted: ${deletedCount}`);
    return deletedCount;
  }
}
