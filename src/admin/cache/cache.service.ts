import { Inject, Injectable } from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BaseService } from '@src/common/base/BaseService';
import { CacheClearDto, KeyType } from './dto/cache-clear.dto';
import {
  RedisPrefix,
  RedisPrefixMtable,
} from '@src/common/const/redis-key.enum';

@Injectable()
export class CacheService extends BaseService {
  // private messageHelper;
  constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {
    super();
  }

  async clearCache(params: CacheClearDto) {
    const fullKey =
      params.type == KeyType.多维表格
        ? RedisPrefixMtable + params.key
        : RedisPrefix + params.key;
    let message = '清除缓存成功',
      code = 200;
    if (!(await this.cache.get(fullKey))) {
      message = '缓存不存在';
      code = 200;
    } else if (!(await this.cache.del(fullKey))) {
      message = '清除缓存失败';
      code = 500;
    }

    return {
      message,
      code,
    };
  }
}
