import { Inject, Injectable } from '@nestjs/common';
import FeishuTableHelper from '../hepler/table-helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  BitTableCreateOption,
  BitTableFields,
  BitTableFilter,
  BitTableGetOption,
  BitTablePagination,
  BitTableSearchPayloadParams,
} from '../type/bitable';
@Injectable()
abstract class FeishuTable {
  protected readonly tableHelper: FeishuTableHelper;
  @Inject(CACHE_MANAGER) protected cacheManager: Cache;
  protected appToken = '';
  protected tableId = '';
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
  async list(useCache = false): Promise<BitTablePagination> {
    this.setTableOption();
    return await this.tableHelper.list({}, useCache);
  }

  async search(
    filter: BitTableFilter,
    params: BitTableSearchPayloadParams = {},
    useCache = true,
  ): Promise<BitTablePagination> {
    this.setTableOption();

    // console.log('[ filter ] >', JSON.stringify(filter));
    const res = await this.tableHelper.search(filter, params, useCache);
    // console.log('[ return ] >', res);
    return res;
  }

  async get(recordId: string, params: BitTableGetOption = {}, useCache = true) {
    this.setTableOption();

    return await this.tableHelper.get(recordId, params, useCache);
  }
  async update(recordId, field: BitTableFields, params?: BitTableCreateOption) {
    this.setTableOption();

    return await this.tableHelper.update(recordId, field, params);
  }

  async create(record: BitTableFields) {
    this.setTableOption();

    return await this.tableHelper.create(record);
  }
}
export default FeishuTable;
