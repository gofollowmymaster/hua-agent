import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import IssueStatisticService from './issue-base-statistic.service';
import FeishuFrontendAlertIssueTable from '@src/alert/common/table/frontend-alert-issue-table';
import { ErrorEndpoint } from '@src/alert/common/type/alert';

@Injectable()
export default class PageIssueStatisticService extends IssueStatisticService {
  protected businessLines: Record<string, any>[] = [];
  protected errorEndpoint: ErrorEndpoint = ErrorEndpoint.Page;
  protected readonly tableViews = {
    基础架构:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcn1X5BdgACeyjB5M7RdTxaOb',
    商家运营:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnYRH11ky7fjerPbilzeCtuh',

    仓储物流:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnAwSpp3REFIpMZpMbNRmR4f',
    业财一体:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcne8Q63wbWZSo2BJZGWpk0zf',
  };
  constructor(
    protected readonly feishuIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {
    super(feishuIssueTable, messageHelper, businessLineTable);
  }
}
