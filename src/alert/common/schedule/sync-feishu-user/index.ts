import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
import FeishuDepartmentHelper from '@src/common/feishu/hepler/feishu-department-helper';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import { PrismaService } from '@src/prisma.service';
import Redis from 'ioredis';

@Injectable()
export default class SyncFeishuUser {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(SyncFeishuUser.name);
  constructor(
    protected readonly redisService: RedisService,
    protected prisma: PrismaService,
    protected readonly departmentHelper: FeishuDepartmentHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
  ) {
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  @Cron('0 0 0 * * *')
  async handleCron(force = false) {
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
