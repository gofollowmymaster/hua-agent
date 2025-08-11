import FeishuClient from '../clients/client';
import {
  BitTableCreateOption,
  BitTableFields,
  BitTableFilter,
  BitTableGetOption,
  BitTableSearchPayloadParams,
} from '../type/bitable';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable } from '@nestjs/common';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';

export type TableHelperOptions = {
  appToken: string;
  tableId: string;
  useCache: boolean;
  ttl: number;
};
@Injectable()
class FeishuTableHelper extends FeishuDataApiHelper {
  protected appToken: string;
  protected tableId: string;
  protected useCache = false;
  protected ttl = 1000 * 60 * 10; //默认缓存10分钟

  constructor(
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  setTableOption({ appToken, tableId, useCache, ttl }: TableHelperOptions) {
    this.appToken = appToken;
    this.tableId = tableId;
    this.useCache = useCache;
    this.ttl = ttl;
  }

  buildCacheKey(key: string) {
    const cacheKey = RedisKeys.FEISHU_MTABLE.replace(
      '{appToken}',
      this.appToken,
    ).replace('{tableId}', this.tableId);
    return key ? cacheKey + `:${key}` : cacheKey;
  }
  async list(params: BitTableSearchPayloadParams = {}, useCache = true) {
    return this.readWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.list({
          params,
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
        }),
      useCache,
      '',
    );
  }
  async search(
    filter: BitTableFilter,
    params: BitTableSearchPayloadParams = {},
    useCache = true,
  ) {
    const cacheKey = JSON.stringify(filter).replaceAll(':', '');

    return this.readWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.search({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          params,
          data: {
            filter,
          },
        }),
      useCache,
      cacheKey,
    );
  }
  async get(
    record_id: string,
    params: BitTableGetOption = {},
    useCache = true,
  ) {
    return this.readWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.get({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
            record_id,
          },
          params,
        }),
      useCache,
      record_id,
    );
  }

  async create(records: BitTableFields) {
    return this.requestWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.create({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          data: {
            fields: records,
          },
        }),
    );
  }
  async update(
    recordId: string,
    field: BitTableFields = {},
    params?: BitTableCreateOption,
  ) {
    return this.requestWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.update({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
            record_id: recordId,
          },
          data: {
            fields: field,
          },
          params,
        }),
    );
  }

  async delete(recordId: string) {
    return this.requestWrapper(
      async () =>
        await this.client.client.bitable.appTableRecord.delete({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
            record_id: recordId,
          },
        }),
    );
  }
}

export default FeishuTableHelper;
