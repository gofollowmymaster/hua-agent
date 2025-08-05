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
import { SentryApiService } from '../common/service/sentry-api-service';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { AlertBaseService } from '../common/service/alert-base.service';

@Injectable()
export class FeishuCallbackService extends AlertBaseService {
  readonly redis: Redis;
  constructor(
    // private readonly logger: LoggerService,
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
    super(redisService);
    // this.redis = redisService.getClient();
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
}
