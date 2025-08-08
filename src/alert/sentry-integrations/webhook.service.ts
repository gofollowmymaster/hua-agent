import { Injectable } from '@nestjs/common';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { SentryHookDto } from './dto/sentry-hook';

import { RedisService } from '@src/common/service/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  AlertEvent,
  CommentEvent,
  ErrorEndpoint,
  ErrorLevel,
  IssueAction,
  IssueEvent,
  PageAlertEvent,
  RequestAlertEvent,
} from '../common/type/alert';
import dayjs from 'dayjs';
import CommonAlertCard from '@src/common/feishu/card/alert-card';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { PageErrorService } from '../common/service/page-error-service';
import { RequestErrorService } from '../common/service/request-error-service';
import { ErrorBaseService } from '../common/service/error-base.service';
import { RedisKeys } from '@src/common/const/redis-key.enum';

@Injectable()
export class SentryWebhookService {
  protected readonly redis: Redis;
  protected errorAlertService: ErrorBaseService;

  constructor(
    protected readonly redisService: RedisService,
    protected readonly config: ConfigService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly pageErrorService: PageErrorService,
    protected readonly requestErrorService: RequestErrorService,
  ) {
    // super(redisService);
    this.redis = redisService.getClient();
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

  async getServiceByIssueId(IssueId = ''): Promise<ErrorBaseService> {
    const issueInfo = await this.checkIssueInCache(IssueId);
    const errorEndpoint = issueInfo.errorEndpoint as ErrorEndpoint;

    return this.getServiceByEndPort(errorEndpoint);
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

  /**
   * issue创建暂时通过报错事件处理
   * @param params
   * @returns
   */
  async issue(eventData: IssueEvent) {
    switch (eventData.action) {
      case IssueAction.Created:
        return;

      case IssueAction.Assigned:
        await this.assignTo(eventData);
        return;
      case IssueAction.Resolved:
      case IssueAction.Unresolved:
        console.log('[ resolved ] >', eventData);
        this.modifyStatus(eventData);
        return;
    }
  }
  async modifyStatus(eventData: IssueEvent) {
    const service = await this.getServiceByIssueId(eventData.issueId);

    service.modifyStatusHandler({
      operator: eventData.operator?.email,
      issueId: eventData.issueId,
      issueStatus: eventData.status,
    });
  }

  async assignTo(eventData: IssueEvent) {
    // const
    const userInfo = await this.feishuUserHelper.getUserIdByEmailOrPhone({
      emails: [eventData.assignedTo.email, eventData.operator.email],
      userIdType: 'open_id',
    });

    const service = await this.getServiceByIssueId(eventData.issueId);

    console.log('[ userInfo ] >', userInfo);
    service.assignToHandler({
      issueId: eventData.issueId,
      operator: eventData.operator.email,
      assignTo: eventData.assignedTo.email,
    });
  }
  async error(eventData: AlertEvent) {
    let res;
    const service = await this.getServiceByEndPort(eventData.errorEndpoint);

    switch (eventData.errorEndpoint) {
      case ErrorEndpoint.Page:
        res = await service.errorHookHandler(eventData as PageAlertEvent);
        break;
      case ErrorEndpoint.Server:
        res = await service.errorHookHandler(eventData as RequestAlertEvent);
        break;
    }

    //按前端业务模块3min 内超过10次告警，发送额外致命错误
    const isTooManyWarning = await this.redisService.limiter(
      eventData.pageModuleName,
      10,
      60 * 3,
    );

    if (isTooManyWarning) {
      this.highFrequencyAlertMsg(eventData);
    }
    return res;
  }
  async comment(eventInfo: CommentEvent) {
    const issueInfo = await this.errorAlertService.checkIssueInCache(
      eventInfo.issueId,
    );
    await this.messageHelper.replyInThread(
      JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: 'markdown',
                text: `@${eventInfo.operator}在sentry中回复:${eventInfo.comment}`,
              },
            ],
          ],
        },
      }),
      issueInfo.messageId,
      FeishuMsgType.Post,
    );
  }
  /**
   * 报警暂时通过报错事件处理
   * @param params
   * @returns
   */
  async alert(params: SentryHookDto) {
    return;
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
  async installation(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }

  /**
   * 高频错误报警
   * @param alertInfo
   */
  async highFrequencyAlertMsg(errorEvent: AlertEvent) {
    // await this.alertFeishuAdapter.setEvent(errorEvent);

    const msgData = {
      ...errorEvent,
      rawData: '',
      level: ErrorLevel.FATAL,
      content: '最近3分钟内报错数超过10个,请及时处理',
      timestamp: dayjs().valueOf(),
    };
    const content = CommonAlertCard.buildCardMsg({
      ...msgData,
      project:
        errorEvent?.errorEndpoint === ErrorEndpoint.Page
          ? errorEvent.pageModuleName
          : errorEvent.serverModuleName,
      errorType: '高频报错提醒',
      linkUrl:
        'https://cloud.elnkpro.com:9000/organizations/aplus-frontend-team/issues/?query=is%3Aunresolved%20issue.priority%3A%5Bhigh%2C%20medium%5D%20event.timestamp%3A-1h&referrer=issue-list&statsPeriod=14d',
    });
    // 异步发送飞书消息
    this.errorAlertService.sendFsAlertMsg(msgData, content);
  }
}
