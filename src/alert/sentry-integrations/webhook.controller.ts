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
  SentryHookCommentDto,
  SentryHookDto,
  SentryHookIssueDto,
  SentryHookType,
  SentryWebHookHeader,
} from './dto/sentry-hook';
import { getModuleNameByUrl } from '../common/utils';
import {
  AlertEvent,
  ErrorEndpoint,
  IssueAction,
  PageModuleName,
} from '../common/type/alert';
// import { verifySignature } from './util';
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
    console.log('[ resource ] >', resource);
    switch (resource) {
      case SentryHookType.Error:
        return await this.error(params);

      case SentryHookType.Issue:
        return await this.issue(params);

      case SentryHookType.Comment:
        return await this.comment(params);

      case SentryHookType.EventAlert:
      case SentryHookType.MetricAlert:
        return await this.sentryWebhookService.alert(params);
      case SentryHookType.Installation:
        return await this.sentryWebhookService.installation(params);
    }
  }
  async issue(params: SentryHookIssueDto) {
    const issueInfo = {
      action: params.action as unknown as IssueAction,
      issueId: params.data.issue.id,
      substatus: params.data.issue.substatus,
      status: params.data.issue.status,
      statusDetails: params.data.issue.statusDetails,
      culprit: params.data.issue.culprit,
      assignedTo: params.data.issue.assignedTo,
      issueType: params.data.issue.issueType,
      level: params.data.issue.level,
      type: params.data.issue.type,
      operator: params.data.assignee,
    };
    console.log('[ issueInfo ] >', issueInfo);
    return await this.sentryWebhookService.issue(issueInfo);
  }
  async comment(params: SentryHookCommentDto) {
    const operator = params.actor.name;
    const issueId = params.data.issue_id + '';
    const comment = params.data.comment;
    this.sentryWebhookService.comment({
      operator,
      issueId,
      comment,
    });
  }
  async error(params: SentryHookDto) {
    const alertError = params.data.error;

    const requestData = alertError.extra?.__serialized__;
    const serverModuleName = getModuleNameByUrl(requestData?.url);
    const pageModuleName =
      alertError.extra?.subModuleName || PageModuleName.APLUS_OTHER;
    const eventData: AlertEvent = {
      ...alertError,
      title: alertError.title,
      requestData,
      pageModuleName,
      serverModuleName,
      errorEndpoint: alertError.extra?.errorEndpoint || ErrorEndpoint.Page,
    };
    return await this.sentryWebhookService.error(eventData);
  }
}
