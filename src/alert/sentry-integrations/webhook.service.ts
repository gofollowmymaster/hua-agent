import { Injectable } from '@nestjs/common';
// import { any } from './dto/sentry-hook';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { ConfigService } from '@nestjs/config';
import { AlertMsgService } from '../alert-message/alert-message.service';
import { SentryHookDto, SentryHookErrorDto } from './dto/sentry-hook';

@Injectable()
export class SentryWebhookService {
  constructor(
    private readonly config: ConfigService,
    readonly prisma: PrismaService,
    readonly alertMsg: AlertMsgService,
  ) {}

  async issue(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)), this.config);
  }
  async error(params: SentryHookErrorDto) {
    const eventData = params.data.error;
    this.alertMsg.sentryAlertHook(eventData);
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
