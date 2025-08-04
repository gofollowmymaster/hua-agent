import { HttpException, Injectable } from '@nestjs/common';
import { FeishuCallbackDto } from './dto/feishu-callback.dto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import Redis from 'ioredis';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import AlertFeishuAdapter from '../common/adapter/alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { ErrorEndpoint } from '../common/type/alert';
import { SentryApiService } from '../common/service/sentry-api-service';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';

@Injectable()
export class FeishuCallbackService {
  readonly redis: Redis;
  constructor(
    private readonly logger: LoggerService,
    readonly prisma: PrismaService,
    protected readonly redisService: RedisService,
    protected readonly config: ConfigService,
    readonly messageHelper: FeishuMessageHelper,
    // protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    // protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly alertFeishuAdapter: AlertFeishuAdapter,
    readonly sentryService: SentryApiService,
    readonly feishuUserHelper: FeishuUserHelper,
  ) {
    this.redis = redisService.getClient();
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

  async updateTable(
    issue_id: string,
    errorEndpoint: ErrorEndpoint,
    recordNew: Record<string, any>,
  ) {
    const table =
      errorEndpoint === ErrorEndpoint.Server
        ? this.feishuApiIssueTable
        : this.feishuFrontendIssueTable;
    const issueRes = await table.search(
      {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'IssueId',
            operator: 'is',
            value: [issue_id],
          },
        ],
      },
      false,
    );
    if (issueRes.total == 0) {
      sendExceptionToFeishu(new Error('修改卡片消息是未找到issue:' + issue_id));
    } else {
      const record = issueRes.items[0];
      const { record_id: recordId } = record;
      await table.update(recordId, recordNew);
    }
  }
}
