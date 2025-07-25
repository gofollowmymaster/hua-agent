import { Injectable } from '@nestjs/common';

import AdminMtableTable from './table/mtable-table';
import { BaseService } from '@src/common/base/BaseService';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';

@Injectable()
export class MtableService extends BaseService {
  constructor(
    private readonly adminMtableTable: AdminMtableTable,
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {
    super();
  }

  async list() {
    // this.LogOperatorAdapter = new LogOperatorAdapter(params);
    // const record = this.LogOperatorAdapter.toTableData();
    // return await this.adminMtableTable.list();
    return await this.adminMtableTable.search({
      conjunction: 'and',
      conditions: [
        {
          field_name: '环境',
          operator: 'contains',
          value: [process.env.NODE_ENV],
        },
      ],
    });
  }
  async aplusBussnessList() {
    const list = await this.feishuBusinessLineTable.list();

    return list;
  }
}
