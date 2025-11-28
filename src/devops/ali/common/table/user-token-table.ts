import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
@Injectable()
class UserAliyunTable extends FeishuTable {
  protected useCache = false;
  protected ttl = 60 * 60; //缓存1小时
  constructor(readonly tableHelper: FeishuTableHelper) {
    super();
    this.appToken = NodeConfigService.getFeishuTableConfig(
      'DevopsTableAppToken',
    );
    this.tableId = 'tbl4OGujdEQ5e0eW';
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
  async getUserAliyunToken(operator: string) {
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '用户',
          operator: 'is',
          value: [operator],
        },
        {
          field_name: '状态',
          operator: 'is',
          value: ['true'],
        },
      ],
    };
    const info = await this.search(
      filter,
      {
        user_id_type: 'union_id',
      },
      true,
    );
    const user = info.items[0].fields;
    const token = user['云效token']?.[0]?.text;
    if (!user['状态'] || !token) {
      throw new Error(`未找到用户${operator}的授权阿里云账号`);
    }
    return token;
  }
}
export default UserAliyunTable;
