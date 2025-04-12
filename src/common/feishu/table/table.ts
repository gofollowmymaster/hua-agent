import { CACHE_MANAGER } from '@nestjs/cache-manager';
import FeishuTableHelper from '../hepler/table-helper';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
class FeishuTable {
  constructor(
    private readonly tableHelper: FeishuTableHelper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async syncToCache(appToken, tableId) {
    const list = await this.tableHelper.list(appToken, tableId);
    const {
      data: { items },
    } = list;
    this.cacheManager.set(appToken + tableId, items);
    return list;
  }
  async list(appToken, tableId) {
    const list = await this.cacheManager.get(appToken + tableId);
    console.log('[ list ] >', list);
    if (!list) {
      return await this.syncToCache(appToken, tableId);
    }
    return list;
  }
  async create(appToken, tableId, record) {
    const res = await this.tableHelper.create(appToken, tableId, record);
    this.syncToCache(appToken, tableId);
    return res;
  }
}
export default FeishuTable;
