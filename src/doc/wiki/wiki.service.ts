import { Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from '../schedule/wiki-directory';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { WikiSearchDto, WikiTreeDto } from './dto/wiki.dto';
import FeishuWikiHelper from '@src/common/feishu/helper/feishu-wiki-helper';
import { toSnakeCase } from '@src/common/utils/data';

@Injectable()
export class WikiService {
  private readonly redis: Redis;

  constructor(
    private readonly logger: LoggerService,
    private wikiDirectoryService: WikiDirectoryService,
    private readonly feishuWikiHelper: FeishuWikiHelper,
    private readonly redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
  }

  async tree({ spaceId, force = false }: WikiTreeDto) {
    const key = this.redisService.buildCacheKey(
      RedisKeys.WIKI_DIRECTORY,
      '{spaceId}',
      spaceId,
    );
    const data = (await this.redis.get(key)) || '';
    let tree;

    if (!data || force) {
      tree = await this.wikiDirectoryService.loadWikiNodeTree(spaceId);
    } else {
      tree = JSON.parse(data);
    }

    return {
      data: tree,
    };
  }
  async search(params: WikiSearchDto) {
    const res = this.feishuWikiHelper.search(toSnakeCase(params));
    return res;
  }
}
