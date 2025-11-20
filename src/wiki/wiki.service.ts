import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from './schedule/wiki-directory';
import { RedisService } from '@src/common/service/redis/redis.service';

@Injectable()
export class WikiService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
    private wikiDirectoryService: WikiDirectoryService,
    private readonly redisService: RedisService,
  ) {}

  async tree(spaceId: string) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.WIKI_DIRECTORY,
      '{spaceId}',
      spaceId,
    );
    let tree = await this.cache.get(key);

    if (!tree) {
      tree = await this.wikiDirectoryService.loadWikiNodeTree(spaceId);
    }

    return {
      data: tree,
    };
  }
}
