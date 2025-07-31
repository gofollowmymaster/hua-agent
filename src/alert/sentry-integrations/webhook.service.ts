import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { SentryHookDto, SentryHookErrorDto } from './dto/sentry-hook';

import { RedisService } from '@src/common/service/redis/redis.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import AlertFeishuAdapter from '../common/adapter/alert-feishu-adapter';
import FeishuApiAlertTable from '../common/table/api-alert-table';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertTable from '../common/table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { ActionLimitException } from '@src/common/exception/action-limit-exception';
import Redis from 'ioredis';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import {
  AlertEvent,
  ErrorEndpoint,
  ErrorLevel,
  PageModuleName,
} from '../common/type/alert';
import { getModuleNameByUrl } from '../common/utils';
import { AlertBaseService } from '../common/service/alert-base.service';
import dayjs from 'dayjs';
import { count } from 'console';
import CommonAlertCard from '@src/common/feishu/card/alert-card';
import ErrorUnresolvedCard from '@src/common/feishu/card/error-unresolve-card';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';

@Injectable()
export class SentryWebhookService extends AlertBaseService {
  private readonly redis: Redis;
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
  ) {
    super();
    this.redis = redisService.getClient();
  }

  /**
   * issue创建暂时通过报错事件处理
   * @param params
   * @returns
   */
  async issue(params: SentryHookDto) {
    return;
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
  }
  async error(params: SentryHookErrorDto) {
    const alertError = params.data.error;

    const requestData = alertError.extra?.__serialized__;
    const serverModuleName = getModuleNameByUrl(requestData?.url);

    const eventData: AlertEvent = {
      ...alertError,
      title: alertError.title,
      requestData,
      pageModuleName:
        alertError.extra?.subModuleName || PageModuleName.APLUS_OTHER,
      serverModuleName,
      errorEndpoint: alertError.extra?.errorEndpoint || ErrorEndpoint.Page,
    };
    const res = await this.sentryErrorHook(eventData);

    //3min 内超过20次告警，发送额外致命错误
    const isTooManyWarning = await this.redisService.limiter('', 20, 60 * 3);

    if (isTooManyWarning) {
      this.highFrequencyAlertMsg(eventData);
    }
    return res;
  }
  async comment(params: SentryHookDto) {
    sendExceptionToFeishu(new Error(JSON.stringify(params)));
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

  async sentryErrorHook(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);
    this.writeToTable(errorEvent);

    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      errorEvent.issue_id,
    );
    const issueInfo = await this.redis.hgetall(key);
    console.log('[ issueInfo ] >', issueInfo);
    if (!issueInfo.issueId) {
      const cardData = this.alertFeishuAdapter.toUnresolvedCardeData();
      const content = ErrorUnresolvedCard.buildCardMsg(cardData);
      const groupMsgInfo = await this.sendFsAlertMsg(errorEvent, content);
      const issueInfo = {
        issueId: errorEvent.issue_id,
        count: 1,
        messageId: groupMsgInfo.message_id,
      };
      this.redis.hset(key, issueInfo);
      return;
    }
    // 如果issueInfo存在，修改数量并回复之前的错误
    await this.redis.hset(key, {
      count: parseInt(issueInfo?.count || '0') + 1,
    });
    const res = await this.messageHelper.replyInThread(
      JSON.stringify({
        text:
          '有新的错误发生，请及时处理，今日累计发生次数：' + issueInfo.count,
      }),
      issueInfo.messageId,
    );

    console.log('[ res ] >', res);

    // const isLimited = await this.redisService.limiter(
    //   errorEvent.issue_id,
    //   1,
    //   60 * 5,
    // ); // 限制每5分钟最多处理一次
    // if (isLimited) throw new ActionLimitException('已记录日志，但没有发送消息');
    // this.highFrequencyAlertMsg(errorEvent);
    // 异步发送飞书消息
  }

  /**
   * 高频错误报警
   * @param alertInfo
   */
  async highFrequencyAlertMsg(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);

    if (errorEvent?.errorEndpoint === ErrorEndpoint.Server) {
      errorEvent.pageModuleName = undefined;
    }
    const msgData = {
      ...errorEvent,
      rawData: '',
      level: ErrorLevel.FATAL,
      eventType: 'HighFrequencyError',
      culprit: '最近3分钟内报错数超过10个,请及时处理',
      timestamp: dayjs().valueOf(),
    };
    const content = CommonAlertCard.buildCardMsg({
      ...msgData,
      project: errorEvent.pageModuleName,
      errorMessage: '高频报错提醒',
      linkUrl:
        'https://cloud.elnkpro.com:9000/organizations/aplus-frontend-team/issues/?query=is%3Aunresolved%20issue.priority%3A%5Bhigh%2C%20medium%5D%20event.timestamp%3A-1h&referrer=issue-list&statsPeriod=14d',
    });
    // 异步发送飞书消息
    this.sendFsAlertMsg(msgData, content);
  }
}
