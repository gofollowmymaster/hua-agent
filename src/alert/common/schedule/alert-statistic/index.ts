import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';
import { ErrorEndpoint } from '../../type/alert';
import { PushIssueCardToUserParams } from '../../type/sentry-issue';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';

@Injectable()
export default class AlertStatisticService extends BaseSchedule {
  protected readonly cron = '0 45 17 * * *';
  protected readonly jobName = 'Alert Statistic Per Day';

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
    this.pageIssueService.dayStatistic();
    this.requestIssueService.dayStatistic();
  }
  async pushIssueCardToUser({
    businessLine,
    errorEndpoint,
    userId,
    period,
  }: PushIssueCardToUserParams) {
    if (errorEndpoint === ErrorEndpoint.Page) {
      this.pageIssueService.pushIssueCardToUser(businessLine, userId, period);
    } else if (errorEndpoint === ErrorEndpoint.Server) {
      this.requestIssueService.pushIssueCardToUser(
        businessLine,
        userId,
        period,
      );
    }
  }
}
