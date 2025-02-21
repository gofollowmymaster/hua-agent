import { Body, Controller, Post } from '@nestjs/common';

import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { FeishuEventService } from './event.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('飞书事件回调')
@Controller('feishu-event')
export class FeishuEventController {
  constructor(
    private readonly feishuEventService: FeishuEventService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: '发送报警消息',
    description: '发送飞书报警消息，非节假日指定时段会电话通知',
  })
  @ApiBody({ type:  FeishuEventCallbackDto })
  @Post('callback')
  // 接收已表情回复webhook
  async feishuEventCallback(@Body() callbackInfo: FeishuEventCallbackDto) {
    // 验证
    if (callbackInfo.type === 'url_verification') {
      return { challenge: callbackInfo.challenge };
    }
    const res = await this.feishuEventService.handle(callbackInfo);
    this.logger.info('res:', res);
    return { challenge: callbackInfo.challenge, data: res, code: 200 };
  }
}
