import { Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WikiService } from '@src/doc/wiki/wiki.service';

@Injectable()
export default class WikiSensitiveWordsCheckService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = '0 9-20 * * * *';
  protected readonly jobName = 'Wiki-Sensitive-Words-Check';

  constructor(
    protected readonly tenantContext: TenantContext,
    protected readonly wikiService: WikiService,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
  }

  protected async handle() {
    this.wikiService.batchSearch();
  }
}
