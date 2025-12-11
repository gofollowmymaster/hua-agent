import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { NodeConfigService } from '@src/config/node-config.service';
@Injectable()
class DevopsPublishLogTable extends FeishuTable {
  protected useCache = false;
  protected ttl = 60 * 60; //缓存1小时
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = NodeConfigService.getFeishuTableConfig(
      'DevopsTableAppToken',
    );
    this.tableId = 'tblp1DkiJ4jyU4I5';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
  async updateStatus() {}
}
export default DevopsPublishLogTable;
