import { AlertBaseService } from './alert-base.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import {
  AlertEvent,
  AssignEvent,
  CloseIssueEvent,
  ModifyStatusEvent,
} from '../type/alert';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import ErrorUnresolvedCard, {
  issueStatusMap,
  UnresolvedCardData,
} from '@src/common/feishu/card/error-unresolve-card';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import BaseAlertFeishuAdapter from '../adapter/base-alert-feishu-adapter';
import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';

export abstract class ErrorBaseService extends AlertBaseService {
  protected errorEvent: AlertEvent;
  protected readonly alertFeishuAdapter: BaseAlertFeishuAdapter;

  protected readonly feishuApiTable: FeishuApiAlertTable;
  protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable;
  protected readonly feishuFrontendTable: FeishuFrontendAlertTable;
  protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable;

  constructor(protected readonly redisService: RedisService) {
    super(redisService);
  }
  async setErrorEvent(errorEvent: AlertEvent) {
    await this.alertFeishuAdapter.setEvent(errorEvent);

    this.errorEvent = errorEvent;
  }

  protected abstract writeToTable(errorEvent: AlertEvent);
  abstract errorHookHandler(alertInfo: AlertEvent);
  abstract updateTable(issueId: string, recordNew: Record<string, any>);

  protected async errorHandler(eventRecord: Record<string, any>) {
    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      this.errorEvent.issueId,
    );
    const issueInfo = await this.redis.hgetall(key);
    //新issue 发送卡片消息
    if (!issueInfo.issueId) {
      const cardData = this.alertFeishuAdapter.toAplusAlertCardeData();
      cardData.linkUrl = eventRecord.recordUrl;
      const content = ErrorUnresolvedCard.buildCardMsg(cardData);
      const groupMsgInfo = await this.sendFsAlertMsg(this.errorEvent, content);
      const issueInfo = {
        issueId: this.errorEvent.issueId,
        count: 1,
        messageId: groupMsgInfo.message_id,
        cardData: JSON.stringify(cardData),
        errorEndpoint: this.errorEvent.errorEndpoint,
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
  }
  async assignToHandler(eventData: AssignEvent) {
    const issueInfo = await this.checkIssueInCache(eventData.issueId);

    this.updateIssueCardDataInCache(eventData.issueId, {
      userId: eventData.assignTo,
    });
    if (issueInfo.messageId) {
      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'at',
                  user_id: eventData.operator,
                },
                {
                  tag: 'text',
                  text: `将问题指派给`,
                },
                {
                  tag: 'at',
                  user_id: eventData.assignTo,
                },
              ],
            ],
          },
        }),
        issueInfo.messageId,
        FeishuMsgType.Post,
      );
    }

    this.updateTable(issueInfo.issueId, {
      负责人: [{ id: eventData.assignTo }],
    });
  }

  async modifyStatusHandler(eventData: ModifyStatusEvent) {
    const issueInfo = await this.checkIssueInCache(eventData.issueId);
    if (issueInfo.messageId) {
      this.updateIssueCardDataInCache(eventData.issueId, {
        status: issueStatusMap[eventData.issueStatus],
      });

      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'at',
                  user_id: eventData.operator,
                },
                {
                  tag: 'text',
                  text: `将问题状态修改为`,
                },
                {
                  tag: 'text',
                  text:
                    issueStatusMap[eventData.issueStatus] ||
                    eventData.issueStatus,
                  style: ['bold'],
                },
              ],
            ],
          },
        }),
        issueInfo.messageId,
        FeishuMsgType.Post,
      );
    }
    if (
      !['resolved', 'ignoreCount100', 'ignoreCount1000'].includes(
        eventData.issueStatus,
      )
    ) {
      return;
    }
    this.updateTable(issueInfo.issueId, {
      是否解决: true,
    });
  }

  async closeIssueHandler(eventData: CloseIssueEvent) {
    const issueInfo = await this.checkIssueInCache(eventData.issueId);
    if (issueInfo.messageId) {
      this.updateIssueCardDataInCache(eventData.issueId, {
        reason: eventData.reason,
        solution: eventData.solution,
      });

      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'at',
                  user_id: eventData.operator,
                },
                {
                  tag: 'text',
                  text: `将本问题关闭🎉🎉\n【问题原因】${eventData.reason}\n【处理方法】${eventData.solution}`,
                },
              ],
            ],
          },
        }),
        issueInfo.messageId,
        FeishuMsgType.Post,
      );
    }

    this.updateTable(issueInfo.issueId, {
      错误原因: eventData.reason,
      解决方案: eventData.solution,
    });
  }
}
