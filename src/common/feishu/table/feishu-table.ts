import { Injectable } from '@nestjs/common';
import FeishuTableHelper from '../helper/table-helper';
import {
  BitTableCreateOption,
  BitTableCreateRecord,
  BitTableFields,
  BitTableFilter,
  BitTableGetOption,
  BitTablePagination,
  BitTableRecord,
  BitTableSearchPayloadParams,
} from '../type/bitable';
import { TenantCode } from '@src/config/tenant';
@Injectable()
abstract class FeishuTable {
  protected readonly tableHelper: FeishuTableHelper;
  protected appToken: string | Record<TenantCode, string> = '';
  protected tableId: string | Record<TenantCode, string> = '';
  protected useCache = false;
  protected ttl = 60 * 10; //默认缓存10分钟

  setTableOption() {
    this.tableHelper.setTableOption({
      appToken: this.appToken,
      tableId: this.tableId,
      useCache: this.useCache,
      ttl: this.ttl,
    });
  }
  async list(
    params: BitTableSearchPayloadParams = {},
    useCache = true,
  ): Promise<BitTablePagination> {
    this.setTableOption();
    return await this.tableHelper.list(params, useCache);
  }

  async search(
    filter: BitTableFilter,
    params: BitTableSearchPayloadParams = {},
    useCache = true,
  ): Promise<BitTablePagination> {
    this.setTableOption();

    const res = await this.tableHelper.search(filter, params, useCache);
    return res;
  }

  async get(recordId: string, params: BitTableGetOption = {}, useCache = true) {
    this.setTableOption();

    const { record } = await this.tableHelper.get(recordId, params, useCache);
    return record;
  }
  async update(recordId, field: BitTableFields, params?: BitTableCreateOption) {
    this.setTableOption();

    return await this.tableHelper.update(recordId, field, params);
  }

  async batchUpdate(records: BitTableRecord[], params?: BitTableCreateOption) {
    this.setTableOption();

    return await this.tableHelper.batchUpdate(records, params);
  }

  async create(data: BitTableFields): Promise<BitTableCreateRecord> {
    this.setTableOption();

    const { record } = await this.tableHelper.create(data);
    return record;
  }
}
export default FeishuTable;
