import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
@Injectable()
class WikiFeedbackTable extends FeishuTable {
  protected useCache = true;
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = 'HOYgblSt8aH6zYsWvJ3c5xgfnub';
    this.tableId = 'tbl82XCa8IJpWqci';

    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default WikiFeedbackTable;
