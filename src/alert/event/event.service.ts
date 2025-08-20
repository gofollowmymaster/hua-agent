import { Injectable } from '@nestjs/common';
import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

@Injectable()
export class FeishuEventService {
  protected readonly redis: Redis;
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
    readonly messageHelper: FeishuMessageHelper,
    readonly redisService: RedisService,
    protected readonly feishuApiAlertIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendAlertIssueTable: FeishuFrontendAlertIssueTable,
  ) {
    this.redis = redisService.getClient();
  }

  async handle(callbackInfo: FeishuEventCallbackDto) {
    const { header, event } = callbackInfo;
    const handler = EventHandler[header.event_type];
    if (!handler) {
      sendExceptionToFeishu(new Error('未知事件类型'));
      return;
    }
    const tag = header.event_type + ':' + header.event_id;
    return this.redisService.idempotent(tag, async () => {
      return await handler(event, this);
    });
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
  async pushIssueCardToUser(issueId: string, userId: string) {
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
    if (!issue) {
      this.messageHelper.createToUser(
        {
          receive_id: userId,
          msg_type: 'text',
          content: JSON.stringify({
            text: `抱歉issue Id为${issueId} 的问题不存在`,
          }),
        },
        'open_id',
      );
      return;
    }
    try {
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
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
