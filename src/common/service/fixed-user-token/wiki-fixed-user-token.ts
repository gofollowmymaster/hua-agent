import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { RedisService } from '@src/common/service/redis/redis.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import FixedTokenService from '.';

@Injectable()
export default class WikiFixedTokenService extends FixedTokenService {
  //每30分钟运行一次
  protected readonly cron = '0 */2 * * * *';
  protected readonly jobName = 'Refresh Fixed Token';
  protected readonly projectModule = 'aily';

  constructor(
    protected redisService: RedisService,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(redisService, tenantContext, schedulerRegistry);
  }
}
