import { Injectable } from '@nestjs/common';

import { listTableRecord } from '@src/common/utils/actionTable/listTableRecord';
import { addTableRecord } from '@src/common/utils/actionTable/addTableRecord';
import { searchTableRecord } from '@src/common/utils/actionTable/searchTableRecord';
import { updateTableRecord } from '@src/common/utils/actionTable/updateTableRecord';
import { deleteTableRecord } from '@src/common/utils/actionTable/deleteTableRecord';
import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import {
  BatchDeleteParamsDto,
  SearchParamsDto,
  TableHeaderType,
} from '../dto/table-action.dto';
@Injectable()
export class TableService {
  constructor(private readonly tableHelper: FeishuTableHelper) {}
  async getList(headers: TableHeaderType) {
    const { appToken, tableId } = headers;
    const res = await listTableRecord(appToken, tableId);
    return res;
  }

  async createRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: TableHeaderType,
  ) {
    const { records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await addTableRecord(appToken, tableId, records);
    return res;
  }

  async searchRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: TableHeaderType,
  ) {
    const { data } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await searchTableRecord(appToken, tableId, data);
    return res;
  }

  async updateRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: TableHeaderType,
  ) {
    const { record_id, records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await updateTableRecord(appToken, tableId, record_id, records);
    return res;
  }

  async deleteRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: TableHeaderType,
  ) {
    const { record_id } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await deleteTableRecord(appToken, tableId, record_id);
    return res;
  }
  async batchDeleteRecord(
    params: BatchDeleteParamsDto,
    headers: TableHeaderType,
  ) {
    const { recordIds } = params;
    const { appToken, tableId } = headers;
    this.tableHelper.setTableOption({
      appToken,
      tableId,
      useCache: false,
    });
    const res = await this.tableHelper.batchDelete(recordIds);
    return res;
  }
}
