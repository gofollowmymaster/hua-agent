import { Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WikiService } from '@src/doc/wiki/wiki.service';
import { ScheduleInfo } from '@src/common/decorator/schedule-info.decorator';
import { ScheduledTaskRegistryService } from '@src/common/service/schedule-task/schedule-task.registry.service';

@ScheduleInfo({ module: '文档', description: '定时检查 Wiki 文档敏感词' })
@Injectable()
export default class WikiSensitiveWordsCheckService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = '0 25 8,11,18 * * *';
  protected readonly jobName = 'Wiki-Sensitive-Words-Check';

  constructor(
    protected readonly tenantContext: TenantContext,
    protected readonly wikiService: WikiService,
    protected schedulerRegistry: SchedulerRegistry,
    protected readonly taskRegistry: ScheduledTaskRegistryService,
  ) {
    super(tenantContext, schedulerRegistry, taskRegistry);
  }

  protected async handle() {
    await this.wikiService.batchSearch();
  }
}
