import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
@Injectable()
class DemoPluginMidTable extends FeishuTable {
  protected useCache: boolean = false;
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = 'T3vjbOUv4aZSYdsi6zKcUBr9nEd';
    this.tableId = 'tblLnJI8E8aZJVM2';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default DemoPluginMidTable;
