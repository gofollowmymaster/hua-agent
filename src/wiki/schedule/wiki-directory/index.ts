import { Injectable } from '@nestjs/common';
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
import Redis from 'ioredis';

@Injectable()
export default class WikiDirectoryService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = process.env.WIKI_CRON || '0 0 16 * * *';
  protected readonly jobName = 'Sync Wiki Nodes';
  protected redis: Redis;

  constructor(
    private readonly feishuWikiHelper: FeishuWikiHelper,
    private readonly redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
    console.log('[ cron ] >', this.cron, this.isOpen);
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
        this.redis.set(key, JSON.stringify(wikiTree));
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
    this.redis.set(key, JSON.stringify(wikiTree));
    return wikiTree;
  }
}
