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
  isIgnoreThisError() {
    return false;
  }
  protected abstract writeToTable(errorEvent: AlertEvent);
  abstract errorHookHandler(alertInfo: AlertEvent);
  abstract updateTable(issueId: string, recordNew: Record<string, any>);

  protected async errorHandler() {
    const eventRecord = await this.writeToTable(this.errorEvent);
    if (this.isIgnoreThisError()) {
      this.logger.info('[ ignore this error ] >', this.errorEvent.issueId);
      return;
    }

    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      this.errorEvent.issueId,
    );
    let issueCardData = (await this.redis.hgetall(key)) as UnresolvedCardData;
    //新issue 发送卡片消息
    if (!issueCardData.issueId) {
      issueCardData = this.alertFeishuAdapter.toAplusAlertCardeData();
      issueCardData.linkUrl = eventRecord.recordUrl;
      const content = ErrorUnresolvedCard.buildCardMsg(issueCardData);
      const groupMsgInfo = await this.sendFsAlertMsg(this.errorEvent, content);
      const issueInfo = {
        ...issueCardData,
        messageId: groupMsgInfo.message_id,
      };
      // await this.redis.hset(key, issueInfo);
      await this.updateIssueCardDataInCache(this.errorEvent.issueId, issueInfo);

      this.redis.expire(key, 60 * 60 * 24 * 7);
      return;
    }
    // if (issueCardData.status == '暂时忽略') return;

    const count = parseInt(issueCardData.count + '') + 1;
    // 如果issue在，修改数量并回复之前的错误
    await this.updateIssueCardDataInCache(this.errorEvent.issueId, {
      count,
    });

    let messageText = `错误再次被触发，本周累计发生**${count}**次,[查看详情](${eventRecord.recordUrl}) `;
    if (['已解决', '暂时忽略'].includes(issueCardData.status)) {
      messageText = `<at user_id="${issueCardData.userId}"></at>错误被重新打开,请及时排查,[查看详情](${eventRecord.recordUrl}) `;
      //更新卡片信息  激活
      this.updateByCard(issueCardData.messageId, {
        content: JSON.stringify({
          type: 'template',
          data: {
            template_id: ErrorUnresolvedCard.templateId,
            template_version_name: ErrorUnresolvedCard.templateVersion,
            template_variable: {
              ...issueCardData,
              status: '重新打开',
              color: 'red',
              statusOptions: ErrorUnresolvedCard.statusOptions('待处理'),
            },
          },
        }),
      });
      await this.updateIssueCardDataInCache(this.errorEvent.issueId, {
        status: '重新打开',
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
      issueCardData.messageId,
      FeishuMsgType.Post,
    );
  }
  async assignToHandler(eventData: AssignEvent) {
    const issueInfo = await this.checkIssueInCache(eventData.issueId);

    const {
      user: { name },
    } = await this.feishuUserHelper.getUserInfo({
      userId: eventData.assignTo,
      userIdType: 'open_id',
    });
    this.updateIssueCardDataInCache(eventData.issueId, {
      userId: eventData.assignTo,
      userName: name,
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

    const statusLabel = issueStatusMap[eventData.issueStatus];

    this.updateTable(issueInfo.issueId, {
      //  状态:issueInfo
      状态: statusLabel,
    });
  }

  async closeIssueHandler(eventData: CloseIssueEvent) {
    const issueInfo = await this.checkIssueInCache(eventData.issueId);
    if (issueInfo.messageId) {
      this.updateIssueCardDataInCache(eventData.issueId, {
        reason: eventData.reason,
        solution: eventData.solution,
        status: issueInfo.status == '已解决' ? '已关闭' : issueInfo.status,
      });
      const statusAction = issueInfo.status == '已解决' ? '关闭🎉🎉' : '忽略';
      const message = `将本问题${statusAction}\n【问题原因】${eventData.reason}\n【处理方法】${eventData.solution}`;
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
                  text: message,
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
