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

@Injectable()
export default class ClearAlertPerDayService {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(ClearAlertPerDayService.name);
  constructor(
    private readonly config: ConfigService,
    protected readonly redisService: RedisService,
    protected readonly requestIssueService: RequestIssueStatisticService,
    protected readonly pageIssueService: PageIssueStatisticService,
  ) {
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  @Cron('0 0 0 * * *')
  async handleCron(force = false) {
    if (!force && process.env.NODE_ENV !== 'production') return;

    this.pageIssueService.clear();
    this.requestIssueService.clear();

    return;
  }
}
