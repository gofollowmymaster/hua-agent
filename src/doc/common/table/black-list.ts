import { Injectable } from '@nestjs/common';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RedisService } from '@src/common/service/redis/redis.service';
@Injectable()
class WikiBlackListTable extends FeishuTable {
  protected useCache = false;
  readonly tableHelper: FeishuTableHelper;
  constructor(
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super();
    this.appToken = 'Jy9AbAbsdaMTYVs6H23cOMQRnro';
    this.tableId = 'tblPwHYM7sUwCWDu';
    this.tableHelper = new FeishuTableHelper(
      ClientFactory.create(FeishuApp.XiaoLClient),
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
export default WikiBlackListTable;
