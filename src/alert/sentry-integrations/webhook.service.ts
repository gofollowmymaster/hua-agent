import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { SentryHookDto } from './dto/sentry-hook';

import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import AlertFeishuAdapter from '../common/adapter/alert-feishu-adapter';
import FeishuApiAlertTable from '../common/table/api-alert-table';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertTable from '../common/table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import Redis from 'ioredis';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import {
  AlertEvent,
  CommentEvent,
  ErrorEndpoint,
  ErrorLevel,
  IssueAction,
  IssueEvent,
} from '../common/type/alert';
import { AlertBaseService } from '../common/service/alert-base.service';
import dayjs from 'dayjs';
import CommonAlertCard from '@src/common/feishu/card/alert-card';
import ErrorUnresolvedCard, {
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolve-card';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SentryWebhookService extends AlertBaseService {
  protected readonly redis: Redis;
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly redisService: RedisService,
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly alertFeishuAdapter: AlertFeishuAdapter,
    protected readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
  ) {
    super(redisService);
    // this.redis = redisService.getClient();
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
    // return;
    this.modifyStatusHandler({
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

    console.log('[ userInfo ] >', userInfo);
    this.assignToHandler({
      issueId: eventData.issueId,
      operator: eventData.operator.email,
      assignTo: eventData.assignedTo.email,
    });
  }
  async error(eventData: AlertEvent) {
    const res = await this.errorHookHandler(eventData);

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
    const issueInfo = await this.checkIssueInCache(eventInfo.issueId);
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

  async errorHookHandler(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);
    const eventRecord = await this.writeToTable(errorEvent);

    //接口错误时，部分错误代码不需要发送消息
    if (
      errorEvent.errorEndpoint == ErrorEndpoint.Server &&
      !errorEvent.requestData?.code
    ) {
      sendExceptionToFeishu(new Error('请求报警信息缺少code字段'));
    } else if (
      this.ignoreCodeList.includes(errorEvent.requestData?.code + '')
    ) {
      return;
    }

    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      errorEvent.issueId,
    );
    const issueInfo = await this.redis.hgetall(key);
    //新issue 发送卡片消息
    if (!issueInfo.issueId) {
      const cardData = this.alertFeishuAdapter.toAplusAlertCardeData();
      cardData.linkUrl = eventRecord.recordUrl;
      const content = ErrorUnresolvedCard.buildCardMsg(cardData);
      const groupMsgInfo = await this.sendFsAlertMsg(errorEvent, content);
      const issueInfo = {
        issueId: errorEvent.issueId,
        count: 1,
        messageId: groupMsgInfo.message_id,
        cardData: JSON.stringify(cardData),
        errorEndpoint: errorEvent.errorEndpoint,
      };
      await this.redis.hset(key, issueInfo);
      this.redis.expire(key, 60 * 60 * 24);
      return;
    }
    // 如果issue在，修改数量并回复之前的错误
    await this.redis.hset(key, {
      count: parseInt(issueInfo?.count || '0') + 1,
    });
    const cardData: UnresolvedCardData = JSON.parse(issueInfo.cardData);
    let messageText = `错误再次被触发，本周累计发生**${issueInfo.count}**次,[查看详情](${eventRecord.recordUrl}) `;
    if (['已解决', '暂时忽略'].includes(cardData.status)) {
      messageText = `<at user_id="${cardData.userId}"></at>错误被重新打开,请及时排查,[查看详情](${eventRecord.recordUrl}) `;
      //更新卡片信息  激活
      this.updateByCard(issueInfo.messageId, {
        content: JSON.stringify({
          type: 'template',
          data: {
            template_id: ErrorUnresolvedCard.templateId,
            template_version_name: ErrorUnresolvedCard.templateVersion,
            template_variable: {
              ...JSON.parse(issueInfo.cardData),
              status: '重新打开',
              color: 'red',
              statusOptions: ErrorUnresolvedCard.statusOptions('待处理'),
            },
          },
        }),
      });
    }
    await this.messageHelper.replyInThread(
      JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: 'md',
                text: messageText,
              },
            ],
          ],
        },
      }),
      issueInfo.messageId,
      FeishuMsgType.Post,
    );

    // console.log('[ res ] >', res);
  }

  /**
   * 高频错误报警
   * @param alertInfo
   */
  async highFrequencyAlertMsg(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);

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
    this.sendFsAlertMsg(msgData, content);
  }
}
