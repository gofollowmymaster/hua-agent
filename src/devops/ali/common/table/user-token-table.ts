import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
@Injectable()
class UserAliyunTable extends FeishuTable {
  protected useCache = false;
  protected ttl = 60 * 60; //默认缓存10分钟
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = NodeConfigService.getFeishuTableConfig(
      'DevopsTableAppToken',
    );
    this.tableId = 'tbl4OGujdEQ5e0eW';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default UserAliyunTable;
