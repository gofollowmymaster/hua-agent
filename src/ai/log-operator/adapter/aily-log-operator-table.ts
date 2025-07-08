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
    console.log('[  |----------| ] >', config.get('AilyLogTableAppToken'));
    console.log('[  |----------| ] >', config.get('AilyLogOperatorTableId'));
    this.appToken = config.get('AilyLogTableAppToken');
    this.tableId = config.get('AilyLogOperatorTableId');
  }
}
export default AilyLogOperatorTable;
