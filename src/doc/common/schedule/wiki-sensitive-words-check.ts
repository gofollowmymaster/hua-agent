import { Injectable } from '@nestjs/common';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import BaseSchedule from '@src/common/base/base.schedule';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WikiService } from '@src/doc/wiki/wiki.service';
import { tenantCodeMap } from '@src/config/tenant';

@Injectable()
export default class WikiSensitiveWordsCheckService extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(
    process.env.NODE_ENV,
  );
  protected readonly cron = '0 0 10-18 * * *';
  protected readonly jobName = 'Wiki-Sensitive-Words-Check';

  constructor(
    protected readonly tenantContext: TenantContext,
    protected readonly wikiService: WikiService,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
  }

  protected async handle(tenantData: TenantContextType) {
    if (tenantData.tenantCode === tenantCodeMap.C) return;
    this.wikiService.batchSearch();
  }
}
