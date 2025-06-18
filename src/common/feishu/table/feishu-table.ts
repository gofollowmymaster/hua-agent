import { Inject, Injectable } from '@nestjs/common';
import FeishuTableHelper from '../hepler/table-helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// import { ConfigService } from '@nestjs/config';
@Injectable()
abstract class FeishuTable {
  protected readonly tableHelper: FeishuTableHelper;
  // protected readonly config: ConfigService;
  @Inject(CACHE_MANAGER) protected cacheManager: Cache;
  protected appToken = '';
  protected tableId = '';

  async syncToCache() {
    const res = await this.tableHelper.list(this.appToken, this.tableId);

    const {
      msg,
      code,
      data: { items },
    } = res;
    if (code !== 0) {
      throw new Error(msg + '->' + JSON.stringify(res));
    }
    this.cacheManager.set(this.appToken + this.tableId, items, 60 * 10);
    return items;
  }
  async list() {
    const list = await this.cacheManager.get(this.appToken + this.tableId);
    if (!list) {
      return await this.syncToCache();
    }
    return list;
  }
  async create(record) {
    const res = await this.tableHelper.create(
      this.appToken,
      this.tableId,
      record,
    );
    if (res.code !== 0) {
      throw new Error(res.msg + '->' + JSON.stringify(res));
    }
    this.syncToCache();
    return res;
  }
  async search(filter: Record<string, any>) {
    const { code, msg, data } = await this.tableHelper.search(
      this.appToken,
      this.tableId,
      filter,
    );
    if (code !== 0) {
      throw new Error(msg + '->' + JSON.stringify(data));
    }
    return data.items;
  }
  async update(recordId, field: Record<string, any>) {
    const { code, msg, data } = await this.tableHelper.update(
      this.appToken,
      this.tableId,
      recordId,
      field,
    );
    if (code !== 0) {
      throw new Error(msg + '->' + JSON.stringify(data));
    }
    return data;
  }
}
export default FeishuTable;
