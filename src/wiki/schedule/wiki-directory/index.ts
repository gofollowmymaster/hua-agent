import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuWikiHelper from '@src/common/feishu/hepler/feishu-wiki-helper';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';

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

  @Cron('0 * 11-19 * * *')
  async handleCron() {
    this.logger.debug('WikiDirectoryService Called ');
    for (const spaceId of this.spaceIds) {
      try {
        const wikiTree = await this.loadWikiNodeTree(spaceId);
        const key = RedisKeys.WIKI_DIRECTORY.replace('{spaceId}', spaceId);
        this.cache.set(key, wikiTree, 0);
      } catch (error) {
        console.log('[ [error] ] >', error);
        this.sendAlertMsg(
          `load wiki space ${spaceId} error: ${error.message}，`,
        );
      }
    }
  }
  async loadWikiNodeTree(spaceId: string) {
    const wikiTree = await this.feishuWikiHelper.loadWikiTree(spaceId);
    const key = RedisKeys.WIKI_DIRECTORY.replace('{spaceId}', spaceId);
    this.cache.set(key, wikiTree, 0);
    return wikiTree;
  }
  sendAlertMsg(errorMessage: string) {
    sendCommonCardToFeishu({
      title: '定时同步飞书文档目录失败',
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: `定时同步飞书文档目录失败`,
      content: errorMessage,
    });
  }
}
