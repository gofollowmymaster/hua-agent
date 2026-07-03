import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { NodeConfigService } from '../../config/node-config.service';
@Injectable()
class ClientSecretTable extends FeishuTable {
  protected readonly useCache = true;
  protected readonly ttl = 60 * 60 * 24;

  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = NodeConfigService.getFeishuTableConfig(
      'AplusNodeAdminAppToken',
    );
    this.tableId = 'tblM4JUNtLKnrewV';

    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default ClientSecretTable;
