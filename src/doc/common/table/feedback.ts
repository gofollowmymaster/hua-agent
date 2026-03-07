import { Injectable } from '@nestjs/common';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RedisService } from '@src/common/service/redis/redis.service';
@Injectable()
class WikiFeedbackTable extends FeishuTable {
  protected useCache = true;
  constructor(
    readonly tableHelper: FeishuTableHelper,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super();
    this.appToken = 'HOYgblSt8aH6zYsWvJ3c5xgfnub';
    this.tableId = 'tbl82XCa8IJpWqci';
    this.tableHelper = new FeishuTableHelper(
      ClientFactory.create(FeishuApp.AlertClient),
      userContext,
      redisService,
    );
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
}
export default WikiFeedbackTable;
