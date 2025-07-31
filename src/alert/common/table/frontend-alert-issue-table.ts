import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
@Injectable()
class FeishuFrontendAlertIssueTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;

  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.getOrThrow('AlertTableAppToken');
    this.tableId = config.getOrThrow('AlertFrontendIssueTableAppId');
  }
}
export default FeishuFrontendAlertIssueTable;
