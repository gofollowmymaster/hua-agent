import { Injectable } from '@nestjs/common';
import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryWebhookService {
  constructor(
    private readonly config: ConfigService,
    readonly prisma: PrismaService,
  ) {}

  async handle(data: FeishuEventCallbackDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(data)), this.config);
  }
}
