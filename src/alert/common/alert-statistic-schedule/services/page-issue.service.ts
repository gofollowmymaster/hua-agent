import { ConfigService } from '@nestjs/config';
import { RedisService } from '@src/common/service/redis/redis.service';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import dayjs, { extend } from 'dayjs';
import FeishuFrontendAlertIssueTable from '../../table/frontend-alert-issue-table';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import ErrorStatisticCard from '@src/common/feishu/card/error-statistic-card';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import IssueStatisticService from './issue-base-statistic.service';

const businessLines = ['商家运营', '仓储物流', '业财一体', '基础架构', '其他'];
const statusColorMap = {
  待处理: 'red',
  处理中: 'yellow',
  已解决: 'green',
  已忽略: 'gray',
};

@Injectable()
export default class PageIssueStatisticService extends IssueStatisticService {
  protected busibessLines: Record<string, any>[] = [];
  protected name: string = '前端';
  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly busibessLineTable: FeishuBusinessLineTable,
  ) {
    // return this.statisticService.handleCron();
    super(config, feishuIssueTable, messageHelper, busibessLineTable);
  }
}
