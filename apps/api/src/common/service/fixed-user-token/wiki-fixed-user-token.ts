import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { RedisService } from '@src/common/service/redis/redis.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import FixedTokenService from '.';
import { ScheduledTaskRegistryService } from '@src/common/service/schedule-task/schedule-task.registry.service';

@Injectable()
export default class WikiFixedTokenService extends FixedTokenService {
  //每30分钟运行一次
  protected readonly cron = '0 */30 * * * *';
  protected readonly jobName = 'Refresh Fixed Token';
  protected readonly projectModule = 'aily';

  constructor(
    protected redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
    protected readonly taskRegistry: ScheduledTaskRegistryService,
  ) {
    super(redisService, tenantContext, schedulerRegistry, taskRegistry);
  }
}
