import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import IssueStatisticService from './issue-base-statistic.service';
import FeishuApiAlertIssueTable from '../../table/api-alert-issue-table';

@Injectable()
export default class RequestStatisticService extends IssueStatisticService {
  protected busibessLines: Record<string, any>[] = [];
  protected name: string = '接口';

  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuApiAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly busibessLineTable: FeishuBusinessLineTable,
  ) {
    // return this.statisticService.handleCron();
    super(config, feishuIssueTable, messageHelper, busibessLineTable);
  }
}
