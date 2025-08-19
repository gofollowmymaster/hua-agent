import { ConfigService } from '@nestjs/config';
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
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnILJrLDvkbYzu8c0xDuCuot',
    商家运营:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnDQK29Vm5a3NkvqVK0bRLSf',

    仓储物流:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnyIeJ1exSOfCVdfn4wKJCNd',
    业财一体:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnqV9epUFGJlsKZSDoeKNByg',
  };
  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {
    // return this.statisticService.handleCron();
    super(config, feishuIssueTable, messageHelper, businessLineTable);
  }
}
