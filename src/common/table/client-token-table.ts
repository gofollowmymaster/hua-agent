import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '../service/node-config-service/node-config.service';
@Injectable()
class ClientTokenTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  protected readonly useCache = true;
  protected readonly ttl = 60 * 24 * 7;

  constructor(
    readonly config: NodeConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.get('AplusNodeAdminAppToken');
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
