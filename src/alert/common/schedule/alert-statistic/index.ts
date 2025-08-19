import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';
import { ErrorEndpoint } from '../../type/alert';
import { OpUnitType } from 'dayjs';
import { PushIssueCardToUserParams } from '../../type/sentry';

@Injectable()
export default class AlertStatisticService {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(AlertStatisticService.name);
  constructor(
    private readonly config: ConfigService,
    protected readonly redisService: RedisService,
    protected readonly requestIssueService: RequestIssueStatisticService,
    protected readonly pageIssueService: PageIssueStatisticService,
  ) {
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  @Cron('0 45 17 * * *')
  async handleCron(force = false) {
    //由于统计需要大量请求飞书接口，多环境
    if (!force && process.env.NODE_ENV !== 'production') return;
    this.pageIssueService.dayStatistic();
    this.requestIssueService.dayStatistic();

    return;
  }
  async pushIssueCardToUser({
    businessLine,
    errorEndpoint,
    userId,
    period = 'day',
  }: PushIssueCardToUserParams) {
    if (errorEndpoint === ErrorEndpoint.Page) {
      this.pageIssueService.pushIssueCardToUser(businessLine, userId, period);
    } else if (errorEndpoint === ErrorEndpoint.Server) {
      this.requestIssueService.pushIssueCardToUser(
        businessLine,
        userId,
        period,
      );
    }
  }
}
