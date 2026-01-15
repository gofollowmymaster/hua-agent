import { AlertBaseService } from './alert-base.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import {
  AlertEvent,
  AssignEvent,
  CloseIssueEvent,
  ModifyStatusEvent,
} from '../../alert/common/type/alert';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import ErrorUnresolvedCard from '@src/common/feishu/card/warning-card/error-unresolved-card';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import BaseAlertFeishuAdapter from '../../alert/common/adapter/base-alert-feishu-adapter';
import { BitTableCreateRecord } from '@src/common/feishu/type/bitable';
import { firstValueFrom } from 'rxjs';
import { MsgAlertService } from './msg-alert.service';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { FeishuApp } from '@src/common/feishu/clients';
import { getAppAccessToken } from '@src/common/feishu/utils';
import { HttpService } from '@nestjs/axios';
import { AlertContext } from './alert-event.context';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import {
  IssueStatusEnum,
  BaseWarningCardData,
} from '@src/common/feishu/card/warning-card/interface';
import {
  WarningCardMap,
  WarningCardType,
} from '@src/common/feishu/card/warning-card';

export abstract class ErrorBaseService extends AlertBaseService {
  protected readonly alertFeishuAdapter: BaseAlertFeishuAdapter;
  protected readonly msgAlertService: MsgAlertService;
  protected readonly feishuUserHelper: FeishuUserHelper;
  protected readonly httpService: HttpService;
  protected readonly alertContext: AlertContext;
  protected readonly messageHelper: FeishuMessageHelper;
  protected readonly CardType: WarningCardType = 'professional';

  constructor(protected readonly redisService: RedisService) {
    super(redisService);
  }
  protected getWarningCard() {
    return WarningCardMap[this.CardType];
  }

  protected isIgnoreThisError() {
    return this.alertContext.event.level === 'info';
  }
  protected abstract writeToTable(): Promise<any>;
  abstract errorHookHandler(alertInfo: AlertEvent);
  abstract updateTable(issueId: string, recordNew: Record<string, any>);
  protected afterCreateIssueCard() {}

  async sendFsAlertMsg(alertInfo: AlertEvent, message: string) {
    return await this.msgAlertService.sendFsAlertMsg(alertInfo, message);
  }
  /**
   * 新的错误发生时，获取issue的新状态（重新打开）
   * @param currentStatus
   * @returns
   */
  protected getStatusThenError(currentStatus: IssueStatusEnum) {
    return [
      IssueStatusEnum.closed,
      IssueStatusEnum.resolved,
      IssueStatusEnum.ignoreCount100,
    ].includes(currentStatus)
      ? IssueStatusEnum.reopened
      : currentStatus;
  }
  private async sendNewIssueCard(eventRecord: BitTableCreateRecord) {
    const issueCardData = await this.alertFeishuAdapter.toAplusAlertCardData();
    issueCardData.linkUrl = eventRecord.record_url;
    const content = ErrorUnresolvedCard.buildCardMsg(issueCardData);
    const groupMsgInfo = await this.msgAlertService.sendFsAlertMsg(
      this.alertContext.event,
      content,
    );
    const issueInfo = {
      ...issueCardData,
      messageId: groupMsgInfo.message_id,
      threadId: groupMsgInfo.thread_id,
    };
    await this.updateIssueCardDataInCache(
      this.alertContext.event.issueId,
      issueInfo,
    );
    this.updateTable(issueInfo.issueId, {
      话题信息: JSON.stringify({
        messageId: groupMsgInfo.message_id,
        threadId: groupMsgInfo.thread_id,
        linkUrl: eventRecord.record_url,
      }),
    });
    this.afterCreateIssueCard();
  }

  private async reopenIssueCard(issueCardData: BaseWarningCardData) {
    //更新卡片信息  激活
    this.updateByCard(issueCardData.messageId, {
      content: JSON.stringify({
        type: 'template',
        data: {
          template_id: ErrorUnresolvedCard.templateId,
          template_version_name: ErrorUnresolvedCard.templateVersion,
          template_variable: {
            ...issueCardData,
            status: IssueStatusEnum.reopened,
            color: 'red',
            statusOptions: ErrorUnresolvedCard.statusOptions(
              IssueStatusEnum.unresolved,
            ),
          },
        },
      }),
    });
    await this.updateIssueCardDataInCache(this.alertContext.event.issueId, {
      status: IssueStatusEnum.reopened,
    });
  }
  protected async errorHandler() {
    const eventRecord = await this.writeToTable();
    if (this.isIgnoreThisError()) {
      return;
    }

    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      this.alertContext.event.issueId,
    );
    const issueCardData = (await this.redis.hgetall(
      key,
    )) as BaseWarningCardData;
    //新issue 发送卡片消息
    if (!issueCardData.messageId) {
      this.sendNewIssueCard(eventRecord);
      return;
    }

    const count = parseInt(issueCardData.count + '') + 1;
    // 如果issue在，修改数量并回复之前的错误
    await this.updateIssueCardDataInCache(this.alertContext.event.issueId, {
      count,
    });

    let messageText = `错误再次被触发，累计发生**${count}**次,[查看详情](${eventRecord.record_url}) `;

    // 如果是重新打开,需要更新卡片信息
    const issueStatusNew = this.getStatusThenError(issueCardData.status);

    if (
      issueStatusNew === IssueStatusEnum.reopened &&
      issueCardData.status !== IssueStatusEnum.reopened
    ) {
      messageText = `<at user_id="${issueCardData.userId}"></at>错误被重新打开,请及时排查,[查看详情](${eventRecord.record_url}) `;
      this.reopenIssueCard(issueCardData);
    }
    // 回复信息
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
                  tag: 'md',
                  text: `<at user_id="${eventData.operator}"></at>将问题指派给<at user_id="${eventData.assignTo}"></at>`,
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
        status: IssueStatusEnum[eventData.issueStatus],
      });

      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'md',
                  text: `<at user_id="${eventData.operator}"></at>将问题状态修改为 **${
                    IssueStatusEnum[eventData.issueStatus] ||
                    eventData.issueStatus
                  }**`,
                },
              ],
            ],
          },
        }),
        issueInfo.messageId,
        FeishuMsgType.Post,
      );
    }

    const statusLabel = IssueStatusEnum[eventData.issueStatus];

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
        status:
          issueInfo.status == IssueStatusEnum.resolved
            ? IssueStatusEnum.closed
            : issueInfo.status,
      });
      const statusAction =
        issueInfo.status == IssueStatusEnum.resolved ? '关闭🎉🎉' : '忽略';
      const message = `<at user_id="${eventData.operator}"></at>将本问题${statusAction}\n【问题原因】${eventData.reason}\n【处理方法】${eventData.solution}`;
      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'md',
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
  protected async updateByCard(message_id: string, data) {
    const accessToken = await getAppAccessToken(FeishuApp.AlertClient);
    await firstValueFrom(
      this.httpService.patch(
        'https://open.feishu.cn/open-apis/im/v1/messages/' + message_id,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ),
    );
  }
}
