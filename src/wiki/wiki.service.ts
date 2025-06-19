import { Inject, Injectable } from '@nestjs/common';
import { WikiDto } from './dto/wiki.dto';
import * as lark from '@larksuiteoapi/node-sdk';
import { LoggerService } from '@src/common/service/logger/logger.service';

import { ConfigService } from '@nestjs/config';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import WikiDirectoryService from '@src/common/schedule-task/wiki-directory';

@Injectable()
export class WikiService {
  private readonly wikiDirectoryServer: WikiDirectoryService;

  // private messageHelper;
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
  ) {
    this.wikiDirectoryServer = new WikiDirectoryService(
      this.config,
      this.cache,
    );
  }

  async tree() {
    const spaceId = this.config.getOrThrow('FeishuAplusWikiSpaceId');
    const key = RedisKeys.WIKI_DIRECTORY.replace('{spaceId}', spaceId);
    console.log('[ key ] >', key);
    let tree = await this.cache.get(key);
    if (!tree) {
      tree = await this.wikiDirectoryServer.loadWikiNodeTree();
    }

    return {
      data: tree,
    };
  }
}
