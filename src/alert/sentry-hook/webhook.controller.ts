import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

// import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { SentryWebhookService } from './webhook.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SentryHookType, SentryWebHookHeader } from './dto/sentry-hook';
import { verifySignature } from './util';
@ApiTags('Sentry WebHook')
@Controller('sentry-hook')
@ApiHeaders([
  {
    name: 'Sentry-Hook-Resource',
    enum: SentryHookType,
    description: 'Sentry Hook类型',
  },
  {
    name: 'Sentry-Hook-Signature',
    description: 'Sentry Hook签名',
  },
  {
    name: 'Sentry-Hook-Timestamp',
    description: 'Sentry Hook时间戳',
  },
  {
    name: 'Request-ID',
    description: '请求ID',
  },
  {
    name: 'Content-Type',
    description: '请求内容类型',
  },
])
export class SentryWebhookController {
  constructor(
    private readonly sentryWebhookService: SentryWebhookService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: 'Sentry WebHook入口',
    description: 'Sentry WebHook统一入口',
  })
  @ApiBody({ type:  })
  @Post('webhook')
  // 接收已表情回复webhook
  async webhook(@Headers() headers: SentryWebHookHeader, @Body() params: any) {
    // 验证
    if (!verifySignature(params, headers)) {
      throw new UnauthorizedException('Sentry Hook签名验证失败');
    }
    //处理
    this.sentryWebhookService.handle(params);
    return true;
  }
}
