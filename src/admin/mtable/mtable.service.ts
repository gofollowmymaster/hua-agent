import { Injectable } from '@nestjs/common';

import AdminMtableTable from './table/mtable-table';
import { BaseService } from '@src/common/base/BaseService';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

@Injectable()
export class MtableService extends BaseService {
  constructor(
    private readonly adminMtableTable: AdminMtableTable,
    private readonly feishuBusinessLineTable: FeishuBusinessLineTable,
  ) {
    super();
  }

  async list() {
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '环境',
          operator: 'contains',
          value: [process.env.NODE_ENV],
        },
      ],
    };
    return await this.adminMtableTable.search({ filter });
  }
  async aplusBusinessList() {
    const list = await this.feishuBusinessLineTable.list();

    return list;
  }
}
