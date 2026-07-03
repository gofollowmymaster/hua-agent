import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import ClearIssueService from './clear-issue-base.service';
import FeishuFrontendAlertIssueTable from '@src/alert/common/table/frontend-alert-issue-table';

@Injectable()
export default class PageClearIssueService extends ClearIssueService {
  constructor(
    protected readonly feishuIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {
    super(feishuIssueTable, messageHelper, businessLineTable);
  }
}
