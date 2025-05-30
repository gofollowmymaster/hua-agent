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
    this.appToken =
      config.get('AilyLogTableAppToken') || 'A6qfbapjtafVLYsn9xic6mYNnfT';
    this.tableId = config.get('AilyLogOperatorTableId') || 'tblcE7q8e2vD9c48';
  }
}
export default AilyLogOperatorTable;
