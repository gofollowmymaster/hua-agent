import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
@Injectable()
class FeishuFrontendAlertTable extends FeishuTable {
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken =
      NodeConfigService.getFeishuTableConfig('AlertTableAppToken');
    this.tableId = 'tblC5eTfM9EYmUkN';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default FeishuFrontendAlertTable;
