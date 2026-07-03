import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import BaseSchedule from '@src/common/base/base.schedule';
import FeishuDepartmentHelper from '@src/common/feishu/helper/feishu-department-helper';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { TenantContext } from '@src/common/service/context/tenant.context';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export default class SyncFeishuUser extends BaseSchedule {
  protected readonly cron = '0 0 0 * * *';
  protected readonly jobName = 'Sync User Per Day';
  private readonly redis: Redis;
  constructor(
    protected readonly redisService: RedisService,
    protected prisma: PrismaService,
    protected readonly departmentHelper: FeishuDepartmentHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
    this.redis = redisService.getClient();
  }

  async handle() {
    const departmentId = 'od-a8298cd6d4bf757187107da078bb167e';
    // if (!force && process.env.NODE_ENV !== 'production') return;
    const departmentList =
      await this.departmentHelper.getDepartmentChildren(departmentId);
    const userList = await this.feishuUserHelper.getUserByDepartment({
      department_id: departmentId,
      department_id_type: 'open_department_id',
    });
    console.log('[ departmentList ] >', JSON.stringify(departmentList));

    console.log('[----------- userList ]-------- >', JSON.stringify(userList));
    return;
  }
}
