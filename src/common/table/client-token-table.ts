import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '../../config/node-config.service';
@Injectable()
class ClientTokenTable extends FeishuTable {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 24 * 7;

  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = NodeConfigService.getFeishuTableConfig(
      'AplusNodeAdminAppToken',
    );
    this.tableId = 'tblNF8bpfSvc4ZK0';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default ClientTokenTable;
