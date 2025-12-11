import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import FeishuWikiHelper from '@src/common/feishu/helper/feishu-wiki-helper';
import { RedisService } from '@src/common/service/redis/redis.service';
import globalConfig from '@src/config';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import { TenantCode } from '@src/config/tenant';
import BaseSchedule from '../../../common/base/base.schedule';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export default class WikiDirectoryService extends BaseSchedule {
  protected readonly cron = '0 0 16 * * *';
  protected readonly jobName = 'Sync Wiki Nodes';

  constructor(
    @Inject(CACHE_MANAGER) protected cache: Cache,
    private readonly feishuWikiHelper: FeishuWikiHelper,
    private readonly redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
  }
  protected initContext() {
    const tenantConfig = globalConfig['tenantConfig'];

    for (const tenant in tenantConfig) {
      this.tenantContextDatas.push({
        tenantCode: tenant as TenantCode,
        spaceIds: tenantConfig[tenant]['FeishuWikiSpaceIds'],
      });
    }
  }

  protected async handle(tenantData: TenantContextType) {
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
        this.logger.error(error);
        this.sendAlertMsg(
          `load wiki space ${spaceId} error: ${error.message}，`,
          error?.stack || error,
        );
      }
    }
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
}
