import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuWikiHelper from '@src/common/feishu/hepler/feishu-wiki-helper';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import globalConfig from '@src/config';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { TenantCode } from '@src/config/tenant';

@Injectable()
export default class WikiDirectoryService {
  private readonly spaceIds: string[];
  private readonly logger = new Logger(WikiDirectoryService.name);
  private readonly tenantContextDatas: {
    tenantCode: TenantCode;
    spaceIds: string[];
  }[] = [];

  constructor(
    @Inject(CACHE_MANAGER) protected cache: Cache,
    private readonly feishuWikiHelper: FeishuWikiHelper,
    private readonly redisService: RedisService,
    private readonly tenantContext: TenantContext,
  ) {
    const tenantConfig = globalConfig['tenantConfig'];

    for (const tenant in tenantConfig) {
      // console.log('[ tenantConfig ] >', tenantConfig, tenant);
      this.tenantContextDatas.push({
        tenantCode: tenant as TenantCode,
        spaceIds: tenantConfig[tenant]['FeishuWikiSpaceIds'],
      });
    }
  }

  @Cron('0 0 16 * * *')
  async handleCron() {
    this.logger.debug('WikiDirectoryService Called ');
    this.tenantContextDatas.forEach((tenantData) => {
      this.tenantContext.run(tenantData, async () => {
        for (const spaceId of tenantData.spaceIds) {
          try {
            const wikiTree = await this.loadWikiNodeTree(spaceId);
            const key = this.redisService.buildCacheKey(
              RedisKeys.WIKI_DIRECTORY,
              '{spaceId}',
              spaceId,
            );
            this.cache.set(key, wikiTree, 0);
          } catch (error) {
            console.log('[ [error] ] >', error);
            this.sendAlertMsg(
              `load wiki space ${spaceId} error: ${error.message}，`,
            );
          }
        }
      });
    });
  }
  async loadWikiNodeTree(spaceId: string) {
    const wikiTree = await this.feishuWikiHelper.loadWikiTree(spaceId);
    const key = this.redisService.buildCacheKey(
      RedisKeys.WIKI_DIRECTORY,
      '{spaceId}',
      spaceId,
    );
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
