import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';

@Injectable()
export default class ClearAlertPerDayService extends BaseSchedule {
  protected readonly cron = '0 0 0 * * *';
  protected readonly jobName = 'Clear Alert Count Per Day';

  private readonly redis: Redis;
  private readonly client: FeishuClient;
  constructor(
    protected readonly redisService: RedisService,
    protected readonly requestIssueService: RequestIssueStatisticService,
    protected readonly pageIssueService: PageIssueStatisticService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  async handle() {
    this.pageIssueService.clear();
    this.requestIssueService.clear();
  }
}
