import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import FeishuTableHelper from '../hepler/table-helper';
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
    this.cacheManager.set(this.appToken + this.tableId, items);
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
}
export default FeishuTable;
