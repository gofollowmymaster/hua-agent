import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { RedisKeys } from '@src/common/const/redis-key.enum';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable()
export default class ClearAlertIssueInService {
  private readonly redis: Redis;
  private readonly logger = new Logger(ClearAlertIssueInService.name);
  constructor(
    private readonly config: ConfigService,
    protected readonly redisService: RedisService,
  ) {
    this.redis = redisService.getClient();
  }

  //每日 0点运行一次
  @Cron('0 0 0 * * *')
  async handleCron() {
    this.logger.debug('Set Alert Issue count to 0 Called ');
  }
}
