import { Injectable } from '@nestjs/common';
import FeishuTable from './feishu-table';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '../hepler/table-helper';
@Injectable()
class FeishuBusinessLineTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.getOrThrow('AlertTableAppToken');
    this.tableId = 'tbl1aLjbTNgbgaT6';
  }
}
export default FeishuBusinessLineTable;
