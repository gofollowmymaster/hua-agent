import { Injectable } from '@nestjs/common';
// import FeishuTable from './feishu-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
// import FeishuTableHelper from '../hepler/table-helper';
@Injectable()
class AdminMtableTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  protected readonly useCache: boolean = true;
  protected readonly ttl = 1000 * 60 * 60 * 24 * 7;
  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();

    this.appToken = config.get('AplusNodeAdminAppToken');
    this.tableId = config.get('AplusNodeAdminMtableTableId');
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default AdminMtableTable;
