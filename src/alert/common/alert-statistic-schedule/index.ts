import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';
import FeishuFrontendAlertIssueTable from '@src/alert/common/table/frontend-alert-issue-table';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuClient from '@src/common/feishu/clients/client';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
// import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { RedisService } from '@src/common/service/redis/redis.service';
import dayjs from 'dayjs';
import Redis from 'ioredis';
import RequestIssueStatisticService from './services/request-issue.service';
import PageIssueStatisticService from './services/page-issue.service';

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

  @Cron('0 0 17 * * *')
  async handleCron() {
    this.pageIssueService.statistic();
    this.requestIssueService.statistic();

    return;
  }
}
