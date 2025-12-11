import { HttpException, Injectable } from '@nestjs/common';
import { FeishuCallbackDto } from './dto/feishu-callback.dto';
import EventHandler from './handler';
import { PrismaService } from '@src/prisma.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import Redis from 'ioredis';
import FeishuApiAlertIssueTable from '../common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '../common/table/frontend-alert-issue-table';
import { SentryIssueService } from '../common/service/sentry/sentry-issue-service';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { CommonErrorService } from '../common/service/error-common.service';
import { RequestErrorService } from '../common/service/request-error-service';
import { PageErrorService } from '../common/service/page-error-service';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolved-card';
import { CardCallbackReturnType } from '@src/common/feishu/type/card';
import AlertStatisticService from '../common/schedule/alert-statistic';

@Injectable()
export class FeishuCallbackService extends CommonErrorService {
  readonly redis: Redis;
  constructor(
    readonly prisma: PrismaService,
    protected readonly redisService: RedisService,
    readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    readonly sentryService: SentryIssueService,
    readonly feishuUserHelper: FeishuUserHelper,
    protected readonly pageErrorService: PageErrorService,
    protected readonly requestErrorService: RequestErrorService,
    readonly alertStatisticService: AlertStatisticService,
  ) {
    super(redisService);
  }

  async handle(
    callbackInfo: FeishuCallbackDto,
  ): Promise<CardCallbackReturnType<UnresolvedCardData>> {
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
  // pushIssueCardToUser(params: PushIssueCardToUserParams) {
  //   this.alertStatisticService.pushIssueCardToUser(params);
  // }
}
