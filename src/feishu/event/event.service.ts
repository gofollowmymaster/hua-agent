import { Injectable } from '@nestjs/common';
import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import EventHandler from './handler';

@Injectable()
export class FeishuEventService {
  constructor(private readonly logger: LoggerService) {}

  async handle(callbackInfo: FeishuEventCallbackDto) {
    const { schema, header, event } = callbackInfo;

    this.logger.info('schema:' + schema);
    this.logger.info('event_type:' + header.event_type);
    this.logger.info('create_time:' + header.create_time);
    const handler = EventHandler[header.event_type];
    if (handler) {
      const res = await handler(event);
      console.log('[ return ] >', res);
      return res;
    }
    throw new Error('未知事件类型');
  }
}
