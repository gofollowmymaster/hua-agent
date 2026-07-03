import { Body, Controller, Post } from '@nestjs/common';

import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { FeishuEventService } from './event.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RedisService } from '@src/common/service/redis/redis.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@ApiTags('小郎机器人飞书事件回调')
@Controller('xiaol-event')
export class FeishuEventController {
  constructor(
    private readonly feishuEventService: FeishuEventService,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({
    summary: '飞书事件回调',
    description: '飞书事件回调',
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
    const res = await this.redisService.idempotent(tag, async () => {
      switch (header.event_type) {
        case 'drive.file.edit_v1':
          return await this.feishuEventService.edit(event);

        default:
          sendExceptionToFeishu(new Error('未知事件类型'));
          return;
      }
    });

    return { message: res, code: 200 };
  }
}
