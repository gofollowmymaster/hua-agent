import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import IssueStatisticService from './issue-base-statistic.service';
import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';
import { ignoreCodeList } from '@src/alert/common/service/request-error-service';
import { ErrorEndpoint } from '@src/alert/common/type/alert';

@Injectable()
export default class RequestStatisticService extends IssueStatisticService {
  protected businessLines: Record<string, any>[] = [];
  protected errorEndpoint: ErrorEndpoint = ErrorEndpoint.Server;

  protected readonly tableViews = {
    基础架构:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcncd85SOtRGK4RWcvnb03yoh',
    商家运营:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnX0Y5xbDczGXLASVK4XQQ8e',

    仓储物流:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcn8StQE6rXFKQsRGOA4sOgdY',
    业财一体:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnHqVnQVia4MfE85Nm4F9PEd',
  };

  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuApiAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {
    super(config, feishuIssueTable, messageHelper, businessLineTable);
  }
  protected customFilter(item: Record<string, any>) {
    return !ignoreCodeList.includes(item.fields['业务状态码'][0].text);
  }
}
