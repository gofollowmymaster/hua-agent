import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedisService } from '@src/common/service/redis/redis.service';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';
import { NodeConfigService } from '@src/config/node-config.service';

@Injectable()
export default class ClearAlertPerDayService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = '0 0 0 * * *';
  protected readonly jobName = 'Clear Alert Count Per Day';

  constructor(
    protected readonly redisService: RedisService,
    protected readonly requestIssueService: RequestIssueStatisticService,
    protected readonly pageIssueService: PageIssueStatisticService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
  }

  protected initContext() {
    this.tenantContextDatas = [
      {
        tenantCode: NodeConfigService.get('defaultTenant'),
      },
    ];
  }

  async handle() {
    if (['development', 'dev', 'test'].includes(process.env.NODE_ENV)) return;
    this.pageIssueService.clear();
    this.requestIssueService.clear();
  }
}
