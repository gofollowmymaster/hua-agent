import { Body, Controller, Post } from '@nestjs/common';

// import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { SentryWebhookService } from './webhook.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Sentry WebHook')
@Controller('sentry-hook')
export class SentryWebhookController {
  constructor(
    private readonly feishuEventService: SentryWebhookService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: 'Sentry WebHook入口',
    description: 'Sentry WebHook统一入口',
  })
  // @ApiBody({ type: FeishuEventCallbackDto })
  @Post('webhook')
  // 接收已表情回复webhook
  async webhook(@Body() callbackInfo: any) {
    // 验证
    console.log('[ callbackInfo ] >', callbackInfo);
    return;
  }
}
