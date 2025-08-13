import { Injectable } from '@nestjs/common';

import { BaseService } from '@src/common/base/BaseService';
import { CacheClearDto, CacheGetDto, KeyType } from './dto/cache-clear.dto';
import {
  RedisPrefix,
  RedisPrefixMtable,
} from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable()
export class CacheService extends BaseService {
  private redis: Redis;
  constructor(protected redisService: RedisService) {
    super();
    this.redis = redisService.getClient();
  }

  async delCache(params: CacheClearDto) {
    // delByPattern
    const fullKey =
      params.type == KeyType.多维表格
        ? RedisPrefixMtable + params.table + ':*'
        : RedisPrefix + params.key;
    let message = '清除缓存成功',
      code = 200;

    if (await this.redisService.hasByPattern(fullKey)) {
      this.redisService.delByPattern(fullKey);
      code = 200;
    } else {
      message = '缓存不存在';
      code = 404;
    }

    return {
      message,
      code,
    };
  }

  async getCache(params: CacheGetDto) {
    return await this.redisService.getByPattern(params.key, params.type);
  }
}
