import { Inject, Injectable } from '@nestjs/common';
import FeishuTableHelper from '../hepler/table-helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import {
  BitTableApiOption,
  BitTableFields,
  BitTableFilter,
  BitTablePagination,
} from '../type/bitable';
import { getGlobalAppInstance } from '@utils/app-config';
import { FeishuApiException } from '@src/common/exception/feishu-api-exception';
@Injectable()
abstract class FeishuTable {
  protected readonly tableHelper: FeishuTableHelper;
  @Inject(CACHE_MANAGER) protected cacheManager: Cache;
  protected appToken = '';
  protected tableId = '';
  protected useCache = false;
  protected ttl = 1000 * 60 * 10; //默认缓存10分钟
  buildCacheKey(key: string) {
    const cacheKey = RedisKeys.FEISHU_MTABLE.replace(
      '{appToken}',
      this.appToken,
    ).replace('{tableId}', this.tableId);
    return key ? cacheKey + `:${key}` : cacheKey;
  }

  async readWrapper(key: string, handler: () => Promise<any>, useCache = true) {
    if (!this.cacheManager) {
      this.cacheManager = getGlobalAppInstance(CACHE_MANAGER);
    }
    if (this.useCache || useCache) {
      const cachaeKey = this.buildCacheKey(key);

      let res = await this.cacheManager?.get(cachaeKey);

      if (res) return res;

      res = await handler();
      this.cacheManager.set(cachaeKey, res, this.ttl);
      return res;
    }
    return await handler();
  }
  requestWrapper(handler: () => Promise<any>) {
    return async () => {
      const res = await handler();
      const { code, data } = res;
      if (code !== 0) {
        throw new FeishuApiException(
          `【${code}】   ->  ${JSON.stringify(res)}`,
          500,
        );
      }
      return data;
    };
  }
  async list(useCache = false): Promise<BitTablePagination> {
    return await this.readWrapper(
      '',
      this.requestWrapper(async () => {
        return await this.tableHelper.list(this.appToken, this.tableId);
      }),
      useCache,
    );
  }

  async search(
    filter: BitTableFilter,
    useCache = true,
  ): Promise<BitTablePagination> {
    const cacheKey = JSON.stringify(filter).replaceAll(':', '');
    return await this.readWrapper(
      cacheKey,
      this.requestWrapper(async () => {
        return await this.tableHelper.search(
          this.appToken,
          this.tableId,
          filter,
        );
      }),
      useCache,
    );
  }

  async get(recordId: string, useCache = true) {
    return await this.readWrapper(
      recordId,
      this.requestWrapper(async () => {
        return await this.tableHelper.get(
          this.appToken,
          this.tableId,
          recordId,
        );
      }),
      useCache,
    );
  }
  async update(recordId, field: BitTableFields, params?: BitTableApiOption) {
    const data = this.requestWrapper(
      async () =>
        await this.tableHelper.update(
          this.appToken,
          this.tableId,
          recordId,
          field,
          params,
        ),
    )();

    return data;
  }

  async create(record: BitTableFields) {
    const data = this.requestWrapper(
      async () =>
        await this.tableHelper.create(this.appToken, this.tableId, record),
    )();
    return data;
  }
}
export default FeishuTable;
