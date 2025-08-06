import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FeishuTableHelper from '@src/common/feishu/hepler/table-helper';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { FeishuApiException } from '../exception/feishu-api-exception';
@Injectable()
class FeishuBusinessLineTable extends FeishuTable {
  // protected readonly tableHelper: FeishuTableHelper;
  protected readonly useCache = true;
  protected readonly ttl = 1000 * 60 * 60 * 24;

  constructor(
    readonly config: ConfigService,
    readonly tableHelper: FeishuTableHelper,
  ) {
    super();
    this.appToken = config.getOrThrow('AplusNodeAdminAppToken');
    this.tableId = 'tblbjBv6z2RXX5Qp';
  }

  async getBusinessLineBySubapp(projectName: string) {
    const res = await this.search(
      {
        conjunction: 'and',
        conditions: [
          {
            field_name: '责任项目',
            operator: 'contains',
            value: [projectName],
          },
        ],
      },
      false,
    );
    if (res.items.length === 0) {
      throw new FeishuApiException(`未找到对应的业务线: ${projectName}`, 501);
    }
    const frontendLeaderId = res.items[0].fields['前端leader'][0].id;
    const frontendAlertGroupId = res.items[0].fields['前端监控群'][0].id;
    const frontendGroupId = res.items[0].fields['前端组织群'][0].id;
    const backendLeaderId = res.items[0].fields['后端leader'][0].id;
    const backendAlertGroupId = res.items[0].fields['接口告警群']?.[0]?.id;
    const feishuProjectUrl = res.items[0].fields['飞书项目地址'];
    const bu = res.items[0].fields['业务线']?.[0]?.text;
    console.log('[ ---bu--- ] >', res.items[0].fields['前端leader'][0]);
    return {
      frontendLeaderId,
      frontendLeaderName: res.items[0].fields['前端leader'][0].name,
      frontendAlertGroupId,
      frontendGroupId,
      backendLeaderId,
      backendLeaderName: res.items[0].fields['后端leader'][0].name,
      backendAlertGroupId,
      feishuProjectUrl,
      bu,
    };
  }
}
export default FeishuBusinessLineTable;
