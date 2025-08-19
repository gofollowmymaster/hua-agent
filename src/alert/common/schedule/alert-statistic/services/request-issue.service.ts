import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import IssueStatisticService from './issue-base-statistic.service';
import FeishuApiAlertIssueTable from '@src/alert/common/table/api-alert-issue-table';
import { BitTableConditions } from '@src/common/feishu/type/bitable';
import { ignoreCodeList } from '@src/alert/common/service/request-error-service';

@Injectable()
export default class RequestStatisticService extends IssueStatisticService {
  protected businessLines: Record<string, any>[] = [];
  protected name: string = '接口';

  protected readonly tableViews = {
    基础架构:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcn8PkI1sZCV9wOlA7RpWaKQc',
    商家运营:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcnZVPQbnamy85FgAkjZo95Gh',

    仓储物流:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcn9v0aQylmggN8UiypvGHVqf',
    业财一体:
      'https://q1njej8cpab.feishu.cn/share/base/view/shrcndF3m3gpuGCJkJc6qhTCwbf',
  };

  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuApiAlertIssueTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {
    // return this.statisticService.handleCron();
    super(config, feishuIssueTable, messageHelper, businessLineTable);
  }
  protected customFilter(item: Record<string, any>) {
    return !ignoreCodeList.includes(item.fields['业务状态码'][0].text);
  }
}
