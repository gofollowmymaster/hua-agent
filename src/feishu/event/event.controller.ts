import { Body, Controller, Post } from '@nestjs/common';

import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { FeishuEventService } from './event.service';
import { LoggerService } from '@src/common/service/logger/logger.service';

@Controller('feishu-event')
export class FeishuEventController {
  constructor(
    private readonly feishuEventService: FeishuEventService,
    private readonly logger: LoggerService,
  ) {}

  @Post('callback')
  // 接收已表情回复webhook
  async feishuEventCallback(@Body() callbackInfo: FeishuEventCallbackDto) {
    if(callbackInfo.type === 'url_verification'){
      return {challenge:callbackInfo.challenge};
    } 
    const res = await this.feishuEventService.handle(callbackInfo);
    this.logger.info('res:', res);
    return {challenge:callbackInfo.challenge, data: res };
  }
}
