import { Injectable } from '@nestjs/common';

import AdminMtableTable from './table/mtable-table';
import { BaseService } from '@src/common/base/BaseService';

@Injectable()
export class MtableService extends BaseService {
  constructor(private readonly adminMtableTable: AdminMtableTable) {
    super();
  }

  async list() {
    // this.LogOperatorAdapter = new LogOperatorAdapter(params);
    // const record = this.LogOperatorAdapter.toTableData();
    return await this.adminMtableTable.list();
    return await this.adminMtableTable.search({
      conjunction: 'and',
      conditions: [
        {
          field_name: '环境',
          operator: 'contains',
          value: ['dev'],
        },
      ],
    });
  }
}
