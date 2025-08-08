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

@Injectable()
export default class AlertStatisticService {
  private readonly redis: Redis;
  private readonly client: FeishuClient;
  private readonly logger = new Logger(AlertStatisticService.name);
  constructor(
    private readonly config: ConfigService,
    protected readonly redisService: RedisService,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
  ) {
    this.redis = redisService.getClient();
    this.client = ClientFactory.create(FeishuApp.AlertClient);
  }

  @Cron('0 * * * * *')
  async handleCron() {
    const towdayStart = dayjs().startOf('day').valueOf();
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '创建时间',
          operator: 'isGreater',
          value: ['ExactDate', towdayStart + ''],
        },
      ],
    };
    const RequestIssueData = await this.feishuApiIssueTable.search(
      filter,
      false,
    );
    const PageIssueData = await this.feishuFrontendIssueTable.search(
      filter,
      false,
    );
    console.log(
      '[ ---AlertStatisticService-- data ] >',
      RequestIssueData,
      PageIssueData,
    );
    return;
  }
}
