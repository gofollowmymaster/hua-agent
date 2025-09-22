import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuWikiHelper from '@src/common/feishu/hepler/feishu-wiki-helper';

// import

@Injectable()
export default class WikiDirectoryService {
  private readonly spaceIds: string[];
  private readonly logger = new Logger(WikiDirectoryService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) protected cache: Cache,
    private readonly feishuWikiHelper: FeishuWikiHelper,
  ) {
    this.spaceIds = this.config.getOrThrow('FeishuWikiSpaceIds');
  }

  @Cron('0 0 8-22 * * *')
  async handleCron() {
    this.logger.debug('WikiDirectoryService Called ');
    for (let index = 0; index < this.spaceIds.length; index++) {
      const wikiTree = await this.loadWikiNodeTree(this.spaceIds[index]);
      const key = RedisKeys.WIKI_DIRECTORY.replace(
        '{spaceId}',
        this.spaceIds[index],
      );
      this.cache.set(key, wikiTree, 0);
    }
  }
  async loadWikiNodeTree(spaceId: string) {
    return await this.feishuWikiHelper.loadWikiTree(spaceId);
  }
}
