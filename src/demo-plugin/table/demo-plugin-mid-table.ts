import { Injectable } from '@nestjs/common';
// import FeishuTable from './feishu-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
// import FeishuTableHelper from '../hepler/table-helper';
@Injectable()
class DemoPluginMidTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;

  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken =
      config.get('DemoPluginAppToken') || 'Q1G1w4fRki3q6mkRdsXctsa6nMg';
    this.tableId = config.get('DemoPluginTableId') || 'tbl30cbfvxUQcczg';
  }
}
export default DemoPluginMidTable;
