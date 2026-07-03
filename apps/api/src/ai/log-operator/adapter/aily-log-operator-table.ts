import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '@src/config/node-config.service';
@Injectable()
class AilyLogOperatorTable extends FeishuTable {
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();

    this.appToken = NodeConfigService.getFeishuTableConfig(
      'AilyLogTableAppToken',
    );
    this.tableId = NodeConfigService.getFeishuTableConfig(
      'AilyLogOperatorTableId',
    );
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default AilyLogOperatorTable;
