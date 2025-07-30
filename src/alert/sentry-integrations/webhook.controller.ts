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
import {
  SentryHookDto,
  SentryHookType,
  SentryWebHookHeader,
} from './dto/sentry-hook';
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
  @ApiBody({ type: SentryHookDto })
  @Post('webhook')
  // sentry webhook入口
  async webhook(
    @Headers() headers: SentryWebHookHeader,
    @Body() params: SentryHookDto,
  ) {
    // 验证
    // if ( !verifySignature(params, headers)) {
    //sentry-hook签名验证存在问题，等待解决  https://github.com/getsentry/sentry/issues/71025
    if (!headers['sentry-hook-signature']) {
      throw new UnauthorizedException('Sentry Hook签名验证失败');
    }
    const resource = headers['sentry-hook-resource'];
    switch (resource) {
      case SentryHookType.Error:
        return await this.sentryWebhookService.error(params);

      case SentryHookType.Issue:
        return await this.sentryWebhookService.issue(params);

      case SentryHookType.Comment:
        return await this.sentryWebhookService.comment(params);

      case SentryHookType.EventAlert:
      case SentryHookType.MetricAlert:
        return await this.sentryWebhookService.alert(params);
      case SentryHookType.Installation:
        return await this.sentryWebhookService.installation(params);
    }
  }
}
