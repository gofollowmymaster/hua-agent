import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '@src/config/node-config.service';
@Injectable()
class AdminMtableTable extends FeishuTable {
  protected readonly useCache: boolean = true;
  protected readonly ttl = 60 * 60 * 24 * 7;
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();

    this.appToken = NodeConfigService.getFeishuTableConfig(
      'AplusNodeAdminAppToken',
    );
    this.tableId = 'tblie9P1MV6WEoQC';
    this.setTableOption();
  }
}
export default AdminMtableTable;
