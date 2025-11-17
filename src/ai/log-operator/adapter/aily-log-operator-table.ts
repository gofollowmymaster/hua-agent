import { Injectable } from '@nestjs/common';
// import FeishuTable from './feishu-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
// import FeishuTableHelper from '../hepler/table-helper';
@Injectable()
class AilyLogOperatorTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;

  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();

    this.appToken = config.get('tenantConfig.aplus.AilyLogTableAppToken');
    this.tableId = config.get('tenantConfig.aplus.AilyLogOperatorTableId');
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default AilyLogOperatorTable;
