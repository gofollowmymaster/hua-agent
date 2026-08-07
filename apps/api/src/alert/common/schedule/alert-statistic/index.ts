import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';
import { ErrorEndpoint } from '../../type/alert';
import { PushIssueCardToUserParams } from '../../type/sentry-issue';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';
import { NodeConfigService } from '@src/config/node-config.service';
import { ScheduleInfo } from '@src/common/decorator/schedule-info.decorator';
import { ScheduledTaskRegistryService } from '@src/common/service/schedule-task/schedule-task.registry.service';

@ScheduleInfo({ module: '告警', description: '每日统计告警问题并推送卡片' })
@Injectable()
export default class AlertStatisticService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = '0 45 17 * * *';
  protected readonly jobName = 'Alert Statistic Per Day';

  private readonly redis: Redis;
  constructor(
    protected readonly redisService: RedisService,
    protected readonly requestIssueService: RequestIssueStatisticService,
    protected readonly pageIssueService: PageIssueStatisticService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
    protected readonly taskRegistry: ScheduledTaskRegistryService,
  ) {
    super(tenantContext, schedulerRegistry, taskRegistry);
    this.redis = redisService.getClient();
  }

  protected initContext() {
    this.tenantContextDatas = [
      {
        tenantCode: NodeConfigService.get('defaultTenant'),
      },
    ];
  }
  async handle(store: any, force: boolean = false) {
    if (!force && ['development', 'dev', 'test'].includes(process.env.NODE_ENV))
      return;
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
