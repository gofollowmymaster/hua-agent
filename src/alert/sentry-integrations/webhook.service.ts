import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { AlertMsgService } from '../alert-message/alert-message.service';
import { SentryHookDto, SentryHookErrorDto } from './dto/sentry-hook';
import { BaseService } from '@src/common/base/BaseService';
import { RedisKeys } from '@src/common/const/redis-key.enum';

import { RedisService } from '@src/common/service/redis/redis.service';

@Injectable()
export class SentryWebhookService extends BaseService {
  constructor(
    readonly prisma: PrismaService,
    readonly alertMsgService: AlertMsgService,
    private readonly redisService: RedisService,
    // private readonly redisService: RedisService,
  ) {
    super();
    // this.redisClient = this.redisService.getClient();
  }

  async issue(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)), this.config);
  }
  async error(params: SentryHookErrorDto) {
    const eventData = params.data.error;

    this.alertMsgService.sentryAlertHook(eventData);

    //3min 内超过20次告警，发送额外致命错误
    const isTooManyWarning = await this.redisService.limiter('', 20, 60 * 3);
    console.log('[ isTooManyWarning ] >', isTooManyWarning);
    if (isTooManyWarning) {
      this.alertMsgService.fatalErrorAlertMsg(eventData);
    }
  }
  async comment(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)), this.config);
  }
  async alert(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)), this.config);
  }
  async installation(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)), this.config);
  }
}
