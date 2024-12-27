import { Body, Controller, Post } from '@nestjs/common';

import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { FeishuEventService } from './event.service';
import { LoggerService } from '@src/common/service/logger/logger.service';

@Controller('feishu-event')
export class EventController {
  constructor(
    private readonly feishuEventService: FeishuEventService,
    private readonly logger: LoggerService,
  ) {}

  @Post('callback')
  // 接收已表情回复webhook
  async feishuEventCallback(@Body() callbackInfo: FeishuEventCallbackDto) {
    const res = await this.feishuEventService.handle(callbackInfo);
    this.logger.info('res:', res);
    return { data: res };
  }
}
