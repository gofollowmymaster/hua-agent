import { Body, Controller, Post } from '@nestjs/common';

import { FeishuCallbackDto } from './dto/feishu-callback.dto';
import { FeishuCallbackService } from './callback.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@ApiTags('飞书回调')
@Controller('feishu-callback')
export class FeishuCallbackController {
  constructor(
    private readonly feishuCallbackService: FeishuCallbackService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: '回调统一接口',
    description: '报警机器人飞书回调全局统一接口',
  })
  @ApiBody({ type: FeishuCallbackDto })
  @Post('handler')
  // 接收已表情回复webhook
  async handle(@Body() callbackInfo: FeishuCallbackDto) {
    // 验证
    if (callbackInfo.type === 'url_verification') {
      return { challenge: callbackInfo.challenge };
    }
    try {
      return await this.feishuCallbackService.handle(callbackInfo);
    } catch (error) {
      console.log('[ error ] >', error);
      sendExceptionToFeishu(error);
      const msg = `操作失败:` + error.message;
      return {
        toast: {
          type: 'info',
          content: msg,
          i18n: {
            zh_cn: msg,
            en_us: 'card action failed',
          },
        },
      };
    }
  }
}
