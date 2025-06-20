import { Inject, Injectable } from '@nestjs/common';
import FeishuTableHelper from '../hepler/table-helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
// import { ConfigService } from '@nestjs/config';
@Injectable()
abstract class FeishuTable {
  protected readonly tableHelper: FeishuTableHelper;
  @Inject(CACHE_MANAGER) protected cacheManager: Cache;
  protected appToken = '';
  protected tableId = '';
  protected useCache = false;
  protected ttl = 1000 * 60;
  buildCacheKey(key: string) {
    const cacheKey = RedisKeys.FEISHU_MTABLE.replace(
      '{appToken}',
      this.appToken,
    ).replace('{tableId}', this.tableId);
    return key ? cacheKey + `:${key}` : cacheKey;
  }

  async readWrapper(key: string, handler: () => Promise<any>) {
    if (this.useCache) {
      const cachaeKey = this.buildCacheKey(key);

      let res = await this.cacheManager.get(cachaeKey);
      console.log('[ useCache ] >', this.useCache, cachaeKey, res);

      if (res) return res;

      res = await handler();
      this.cacheManager.set(cachaeKey, res, this.ttl);
      return res;
    }
    return await handler();
  }
  async list() {
    return await this.readWrapper('', async () => {
      const res = await this.tableHelper.list(this.appToken, this.tableId);

      const {
        msg,
        code,
        data: { items },
      } = res;
      if (code !== 0) {
        throw new Error(msg + '->' + JSON.stringify(res));
      }
      return items;
    });
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
    return res;
  }
  async search(filter: Record<string, any>) {
    return await this.readWrapper(filter.toString(), async () => {
      const { code, msg, data } = await this.tableHelper.search(
        this.appToken,
        this.tableId,
        filter,
      );
      if (code !== 0) {
        throw new Error(msg + '->' + JSON.stringify(data));
      }
      return data.items;
    });
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
