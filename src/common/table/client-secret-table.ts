import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
@Injectable()
class ClientSecretTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  protected readonly useCache = true;
  protected readonly ttl = 1000 * 60 * 60 * 24 * 7;

  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.getOrThrow('AplusNodeAdminAppToken');
    this.tableId = 'tblM4JUNtLKnrewV';
  }

  getBusinessLineByAppId(appId: string) {
    return this.search(
      {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'AppId',
            operator: 'is',
            value: [appId],
          },
        ],
      },
      true,
    );
  }
}
export default ClientSecretTable;
