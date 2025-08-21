import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

// import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { SentryWebhookService } from './webhook.service';
import { ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  SentryHookCommentDto,
  SentryHookDto,
  SentryHookErrorDto,
  SentryHookIssueDto,
  SentryHookType,
  SentryWebHookHeader,
} from './dto/sentry-hook';
import { getModuleNameByUrl } from '../common/utils';
import {
  ErrorEndpoint,
  IssueAction,
  PageModuleName,
} from '../common/type/alert';

import { SentryApiService } from '../common/service/sentry-api-service';
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
  // private readonly redis: Redis;
  constructor(
    private readonly sentryWebhookService: SentryWebhookService,
    // protected readonly redisService: RedisService,
    protected readonly sentryApiService: SentryApiService,
  ) {
    // this.redis = redisService.getClient();
  }

  @ApiOperation({
    summary: 'Sentry WebHook入口',
    description: 'Sentry WebHook统一入口',
  })
  @ApiBody({ type: SentryHookDto })
  @Post('webhook')
  /**
   *  sentry webhook入口
   * 所有操作异步进行
   * 当前错误时会丢弃，无补偿措施
   *  */
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
        this.error(params);
        break;
      case SentryHookType.Issue:
        this.issue(params);
        break;
      case SentryHookType.Comment:
        this.comment(params);
        break;

      case SentryHookType.EventAlert:
      case SentryHookType.MetricAlert:
        this.sentryWebhookService.alert(params);
        break;
      case SentryHookType.Installation:
        this.sentryWebhookService.installation(params);
        break;
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
      operator: params.data.assignee ||
        params.data.issue.statusDetails?.actor || {
          email: '管理员',
          name: '管理员',
        },
    };
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

  async error(params: SentryHookErrorDto) {
    const alertError = params.data.error;
    // if (alertError.environment == Environment.PROD) return;
    if (await this.sentryApiService.isIssueIgnored(alertError.issue_id)) return;

    const requestData = alertError.extra?.__serialized__;
    const serverModuleName = getModuleNameByUrl(requestData?.url);
    console.log('[ serverModuleName ] >', serverModuleName);
    const pageModuleName =
      alertError.extra?.subModuleName || PageModuleName.APLUS_OTHER;
    const eventData = {
      ...alertError,
      requestData,
      title: alertError.title,
      issueId: alertError.issue_id,
      issueUrl: alertError.issue_url,
      webUrl: alertError.web_url,
      pageModuleName,
      serverModuleName,
      errorEndpoint: alertError.extra?.errorEndpoint || ErrorEndpoint.Page,
      rawData: params,
    };
    return await this.sentryWebhookService.error(eventData);
  }
}
