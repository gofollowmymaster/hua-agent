import { Injectable } from '@nestjs/common';
import { FeishuCallbackDto } from './dto/feishu-callback.dto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';

@Injectable()
export class FeishuCallbackService {
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
  ) {}

  async handle(callbackInfo: FeishuCallbackDto) {
    const { header, event } = callbackInfo;

    const handler = EventHandler[header.event_type];
    if (handler) {
      const res = await handler(event, this);
      return res;
    }
    throw new Error('未知事件类型');
  }
}
