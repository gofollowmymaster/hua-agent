import { Body, Controller, Post } from '@nestjs/common';

import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { FeishuEventService } from './event.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RedisService } from '@src/common/service/redis/redis.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import {
  EventHandlerParameters,
  ReceiveEventParams,
} from '../common/type/feishu-event';

@ApiTags('飞书事件回调')
@Controller('feishu-event')
export class FeishuEventController {
  constructor(
    private readonly feishuEventService: FeishuEventService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({
    summary: '发送报警消息',
    description: '发送飞书报警消息，非节假日指定时段会电话通知',
  })
  @ApiBody({ type: FeishuEventCallbackDto })
  @Post('callback')
  // 接收已表情回复webhook
  async feishuEventCallback(@Body() callbackInfo: FeishuEventCallbackDto) {
    // 验证
    if (callbackInfo.type === 'url_verification') {
      return { challenge: callbackInfo.challenge };
    }
    const { header, event } = callbackInfo;

    // const handler = EventHandler[header.event_type];

    const tag = header.event_type + ':' + header.event_id;
    const res = this.redisService.idempotent(tag, async () => {
      console.log('[ header.event_type ] >', header.event_type);
      switch (header.event_type) {
        case 'im.message.receive_v1':
          return await this.receive(event);
        case 'im.message.message_read_v1':
          return await this.read(event);
        case 'im.message.reaction.created_v1':
          return await this.reaction(event);
        default:
          sendExceptionToFeishu(new Error('未知事件类型'));
          return;
      }
    });

    return { message: res, code: 200 };
  }

  async receive(event: ReceiveEventParams) {
    return await this.feishuEventService.receive(event);
  }
  async read(event: EventHandlerParameters<'im.message.message_read_v1'>) {
    return await this.feishuEventService.read(event);
  }
  async reaction(
    event: EventHandlerParameters<'im.message.reaction.created_v1'>,
  ) {
    return await this.feishuEventService.reaction(event);
  }
}
