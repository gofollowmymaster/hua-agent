import { HttpException, Injectable } from '@nestjs/common';
import { FeishuCallbackDto } from './dto/feishu-callback.dto';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import Redis from 'ioredis';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { SentryApiService } from '../common/service/sentry-api-service';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { CommonErrorService } from '../common/service/error-common.service';
import { RequestErrorService } from '../common/service/request-error-service';
import { PageErrorService } from '../common/service/page-error-service';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { ErrorBaseService } from '../common/service/error-base.service';
import { ErrorEndpoint } from '../common/type/alert';

@Injectable()
export class FeishuCallbackService extends CommonErrorService {
  readonly redis: Redis;
  constructor(
    readonly prisma: PrismaService,
    protected readonly redisService: RedisService,
    protected readonly config: ConfigService,
    readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    readonly sentryService: SentryApiService,
    readonly feishuUserHelper: FeishuUserHelper,
    protected readonly pageErrorService: PageErrorService,
    protected readonly requestErrorService: RequestErrorService,
  ) {
    super(redisService);
  }

  async checkIssueInCache(issueId: string) {
    const issueInfo = await this.redis.hgetall(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
    );

    if (!issueInfo.issueId) {
      //跨天问题
      throw new Error(`Issue:${issueId}已失效`);
    }
    return issueInfo;
  }
  async getServiceByEndPort(
    errorEndpoint: ErrorEndpoint,
  ): Promise<ErrorBaseService> {
    switch (errorEndpoint) {
      case ErrorEndpoint.Page:
        return this.pageErrorService;
      case ErrorEndpoint.Server:
        return this.requestErrorService;
      default:
        throw new Error('errorEndpoint is not defined');
    }
  }
  async getServiceByIssueId(IssueId = ''): Promise<ErrorBaseService> {
    const issueInfo = await this.checkIssueInCache(IssueId);
    const errorEndpoint = issueInfo.errorEndpoint as ErrorEndpoint;

    return this.getServiceByEndPort(errorEndpoint);
  }

  async handle(callbackInfo: FeishuCallbackDto) {
    const { header, event } = callbackInfo;

    const eventInfo = event || callbackInfo;
    const { action } = eventInfo.action.value;

    if (header?.event_type && header.event_type !== 'card.action.trigger') {
      throw new HttpException('不支持的回调事件类型', 500);
    }

    const handler = EventHandler[action];
    if (handler) {
      const res = await handler(event, this);
      return res;
    }
    throw new Error('未知事件类型');
  }
}
