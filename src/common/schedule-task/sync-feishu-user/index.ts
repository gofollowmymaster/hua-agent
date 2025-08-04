import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable()
export default class SyncFeishuUser {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(SyncFeishuUser.name);
  constructor(
    private readonly config: ConfigService,
    protected readonly redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  @Cron('0 0 * * * *')
  async handleCron() {
    this.logger.debug('Sync User List Info Called ');
    return;

    const list = await this.client.client.directory.v1.employee.filter({
      data: {
        filter: {
          conditions: [
            {
              field: 'base_info.departments.department_id',
              operator: 'eq',
              value: 'od-a8298cd6d4bf757187107da078bb167e',
            },
          ],
        },
        required_fields: ['base_info.*'],
        page_request: {
          page_size: 1000,
          page_token: '',
        },
      },
      params: {
        employee_id_type: 'open_id',
        department_id_type: 'department_id',
        // department_id: 'od-a8298cd6d4bf757187107da078bb167e',
      },
    });
    console.log('[ list ] >', JSON.stringify(list));
  }
}
