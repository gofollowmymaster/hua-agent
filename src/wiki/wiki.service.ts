import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from './schedule/wiki-directory';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable()
export class WikiService {
  private readonly redis: Redis;

  constructor(
    private readonly logger: LoggerService,
    private wikiDirectoryService: WikiDirectoryService,
    private readonly redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
  }

  async tree(spaceId: string) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.WIKI_DIRECTORY,
      '{spaceId}',
      spaceId,
    );
    let tree = JSON.parse(await this.redis.get(key));

    if (!tree) {
      tree = await this.wikiDirectoryService.loadWikiNodeTree(spaceId);
    }

    return {
      data: tree,
    };
  }
}
