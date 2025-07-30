import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { AlertMsgService } from '../alert-message/alert-message.service';
import { SentryHookDto, SentryHookErrorDto } from './dto/sentry-hook';
import { BaseService } from '@src/common/base/BaseService';

import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryWebhookService extends BaseService {
  constructor(
    readonly prisma: PrismaService,
    readonly alertMsgService: AlertMsgService,
    private readonly redisService: RedisService,
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
  ) {
    super();
  }

  /**
   * issue创建暂时通过报错事件处理
   * @param params
   * @returns
   */
  async issue(params: SentryHookDto) {
    return;
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
  async error(params: SentryHookErrorDto) {
    const eventData = params.data.error;

    const res = await this.alertMsgService.sentryAlertHook(eventData);

    //3min 内超过20次告警，发送额外致命错误
    const isTooManyWarning = await this.redisService.limiter('', 20, 60 * 3);

    if (isTooManyWarning) {
      this.alertMsgService.highFrequencyAlertMsg(eventData);
    }
    return res;
  }
  async comment(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
  /**
   * 报警暂时通过报错事件处理
   * @param params
   * @returns
   */
  async alert(params: SentryHookDto) {
    return;
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
  async installation(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
}
