import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from './schedule/wiki-directory';

@Injectable()
export class WikiService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
    private wikiDirectoryService: WikiDirectoryService,
  ) {}

  async tree(spaceId: string) {
    const key = RedisKeys.WIKI_DIRECTORY.replace('{spaceId}', spaceId);
    let tree = await this.cache.get(key);

    if (!tree) {
      tree = await this.wikiDirectoryService.loadWikiNodeTree(spaceId);
    }

    return {
      data: tree,
    };
  }
}
