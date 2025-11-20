import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
@Injectable()
class AilyLogOperatorTable extends FeishuTable {
  constructor(
    readonly config: NodeConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();

    this.appToken = config.getTenantConfig('AilyLogTableAppToken');
    this.tableId = config.getTenantConfig('AilyLogOperatorTableId');
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default AilyLogOperatorTable;
