import FeishuClient from '../clients/client';
import {
  BitTableCreateData,
  BitTableCreateOption,
  BitTableFields,
  BitTableFilter,
  BitTableGetOption,
  BitTableGetData,
  BitTableRecord,
  BitTableSearchPayloadParams,
  BitTableBatchDeleteReturnData,
  BitTableSearchPayloadData,
} from '../type/bitable';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable } from '@nestjs/common';
import FeishuDataApiHelper from './feishu-data-api-helper';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RedisService } from '@src/common/service/redis/redis.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { TenantCode } from '@src/config/tenant';

export type TableHelperOptions = {
  appToken: string | Record<TenantCode, string>;
  tableId: string | Record<TenantCode, string>;
  useCache?: boolean;
  ttl?: number;
};
@Injectable()
class FeishuTableHelper extends FeishuDataApiHelper {
  protected appTokenInfo: string | Record<TenantCode, string>;
  protected tableIdInfo: string | Record<TenantCode, string>;
  protected useCache = false;
  protected ttl = 60 * 10; //默认缓存10分钟

  constructor(
    @Inject(FEISHU_CLIENT_ID) protected readonly feishuClient: FeishuClient,
    protected readonly userContext: TenantContext,
    protected redisService: RedisService,
  ) {
    super(redisService);
  }
  setTableOption({ appToken, tableId, useCache, ttl }: TableHelperOptions) {
    this.appTokenInfo = appToken;
    this.tableIdInfo = tableId;
    this.useCache = useCache ?? false;
    this.ttl = ttl || this.ttl;
    return this;
  }
  get appToken() {
    return typeof this.appTokenInfo === 'string'
      ? this.appTokenInfo
      : this.appTokenInfo[this.userContext.tenant];
  }
  get tableId() {
    return typeof this.tableIdInfo === 'string'
      ? this.tableIdInfo
      : this.tableIdInfo[this.userContext.tenant];
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
        await this.client.bitable.appTableRecord.list({
          params,
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
        }),
      useCache,
      'list',
    );
  }
  async search(
    data: BitTableSearchPayloadData,
    params: BitTableSearchPayloadParams = {},
    useCache = true,
  ) {
    const cacheKey =
      'search:' + JSON.stringify(data?.filter).replaceAll(':', '');
    return this.readWrapper(
      async () =>
        await this.client.bitable.appTableRecord.search({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          params,
          data,
        }),
      useCache,
      cacheKey,
    );
  }
  async get(
    record_id: string,
    params: BitTableGetOption = {},
    useCache = true,
  ): Promise<BitTableGetData> {
    return this.readWrapper(
      async () =>
        await this.client.bitable.appTableRecord.get({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
            record_id,
          },
          params,
        }),
      useCache,
      'mtable-get:' + record_id,
    );
  }

  async create(records: BitTableFields): Promise<BitTableCreateData> {
    return this.requestWrapper(
      async () =>
        await this.client.bitable.appTableRecord.create({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          data: {
            fields: records,
          },
        }),
      'mtable-create',
    );
  }
  async update(
    recordId: string,
    field: BitTableFields = {},
    params?: BitTableCreateOption,
  ) {
    return this.requestWrapper(
      async () =>
        await this.client.bitable.appTableRecord.update({
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
      'mtable-update',
    );
  }
  async batchUpdate(records: BitTableRecord[], params?: BitTableCreateOption) {
    return this.requestWrapper(
      async () =>
        await this.client.bitable.appTableRecord.batchUpdate({
          params,
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          data: {
            records,
          },
        }),
      'mtable-batch-update',
    );
  }

  async delete(recordId: string) {
    return this.requestWrapper(
      async () =>
        await this.client.bitable.appTableRecord.delete({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
            record_id: recordId,
          },
        }),
      'mtable-delete',
    );
  }
  async batchDelete(
    recordIds: string[],
  ): Promise<BitTableBatchDeleteReturnData> {
    return this.requestWrapper(
      async () =>
        await this.client.bitable.appTableRecord.batchDelete({
          path: {
            app_token: this.appToken,
            table_id: this.tableId,
          },
          data: {
            records: recordIds,
          },
        }),
      'mtable-batch-delete',
    );
  }
}

export default FeishuTableHelper;
