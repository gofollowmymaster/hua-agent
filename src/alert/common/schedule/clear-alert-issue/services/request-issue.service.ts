import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import ClearIssueService from './clear-issue-base.service';
import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';

@Injectable()
export default class RequestClearIssueService extends ClearIssueService {
  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuApiAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly busibessLineTable: FeishuBusinessLineTable,
  ) {
    super(config, feishuIssueTable, messageHelper, busibessLineTable);
  }
}
