import { Injectable } from '@nestjs/common';
import FeishuTable from './feishu-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '../hepler/table-helper';
@Injectable()
class FeishuApiAlertTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.getOrThrow('AlertTableAppToken');
    this.tableId = config.getOrThrow('AlertApiTableId');
  }
}
export default FeishuApiAlertTable;
