import { Injectable } from '@nestjs/common';
import { FeishuEventCallbackDto } from './dto/feishu-event.dto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

@Injectable()
export class FeishuEventService {
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
    readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiAlertIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendAlertIssueTable: FeishuFrontendAlertIssueTable,
  ) {}

  async handle(callbackInfo: FeishuEventCallbackDto) {
    const { header, event } = callbackInfo;

    const handler = EventHandler[header.event_type];
    if (handler) {
      const res = await handler(event, this);
      return res;
    }
    throw new Error('未知事件类型');
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
    const issue = await this.getIssueInfo(issueId);
    if (!issue) return;
    try {
      const threadInfo = JSON.parse(
        (issue.fields['话题信息']?.[0]?.text || '') as string,
      );
      const threadId = threadInfo.threadId;
      threadId &&
        (await this.messageHelper.forwardThread(userId, threadId, 'open_id'));
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
