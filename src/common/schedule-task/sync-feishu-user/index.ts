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

  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.debug('Sync User List Info Called ');

    const list = await this.client.client.contact.user.list();
    console.log('[ list ] >', JSON.stringify(list));
  }
}
