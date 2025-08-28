import { Injectable } from '@nestjs/common';
import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '@src/alert/common/table/frontend-alert-issue-table';
import {
  ChatType,
  ReceiveEventParams,
} from '@src/alert/common/type/feishu-event';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';

@Injectable()
export class FeishuReceiveCallback {
  readonly redis: Redis;
  readonly handlers: Record<ChatType, Map<RegExp, string>> = {
    p2p: new Map([
      [/(issue:)?\d+/, 'pushIssueCardToUser'],
      // [/(issue:)?\d+/, 'pushIssueCardToUser'],
    ]),
    group: new Map([
      // [/(issue:)?\d+/, 'pushIssueCardToUser'],
    ]),
  };
  constructor(
    readonly logger: LoggerService,
    readonly messageHelper: FeishuMessageHelper,
    readonly redisService: RedisService,
    protected readonly feishuApiAlertIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendAlertIssueTable: FeishuFrontendAlertIssueTable,
  ) {
    this.redis = redisService.getClient();
  }
  getHandler(message: string, type: ChatType) {
    const handlers = this.handlers[type];
    for (const [regex, handlerName] of handlers) {
      if (regex.test(message)) {
        return this[handlerName];
      }
    }
    return () => {
      this.logger.warn('该消息没有找到:', message);
    };
  }
  async handle(event: ReceiveEventParams) {
    const {
      message: { content: msgContent, message_type, chat_type },
    } = event;
    if (message_type !== 'text') return;
    const { text: content } = JSON.parse(msgContent);

    const handler = this.getHandler(content, chat_type as ChatType).bind(this);

    await handler(event);

    return 'ok';
  }

  async getIssueInfo(issueId: string) {
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: 'IssueId',
          operator: 'is',
          value: [issueId],
        },
      ],
    };
    let issues = await this.feishuApiAlertIssueTable.search(filter);
    if (issues.items.length > 0) return issues.items[0];

    issues = await this.feishuFrontendAlertIssueTable.search(filter);
    if (issues.items.length > 0) return issues.items[0];
  }
  async pushIssueCardToUser(event: ReceiveEventParams) {
    const {
      sender: {
        sender_id: { open_id: userId },
      },
      message: { content: msgContent },
    } = event;
    const { text: content } = JSON.parse(msgContent);
    if (!userId) return;

    const issueId = content.replace('issue:', '');

    const issueInCache = (await this.redis.hgetall(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
    )) as UnresolvedCardData;
    if (issueInCache.issueId) {
      this.messageHelper.replyInThread(
        JSON.stringify({
          zh_cn: {
            content: [
              [
                {
                  tag: 'md',
                  text: `<at user_id="${userId}"></at>追踪了此问题`,
                },
              ],
            ],
          },
        }),
        issueInCache.messageId,
        FeishuMsgType.Post,
      );
      return;
    }
    const issue = await this.getIssueInfo(issueId);
    if (!(issue?.fields['话题信息'] as []).length) {
      this.messageHelper.createToUser(
        {
          receive_id: userId,
          msg_type: 'text',
          content: JSON.stringify({
            text: `抱歉issueId为${issueId} 的问题不存在`,
          }),
        },
        'open_id',
      );
      return;
    }
    const threadInfo = JSON.parse(
      (issue.fields['话题信息']?.[0]?.text || '') as string,
    );
    const threadId = threadInfo.threadId;
    if (!threadId) {
      this.messageHelper.createToUser(
        {
          receive_id: userId,
          msg_type: 'text',
          content: JSON.stringify({
            text: `抱歉issue Id为${issueId} 的问题当前没有记录到话题信息`,
          }),
        },
        'open_id',
      );
      return;
    }
    threadId &&
      (await this.messageHelper.forwardThread(userId, threadId, 'open_id'));
  }
}
