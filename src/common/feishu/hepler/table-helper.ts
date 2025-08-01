import FeishuClient from '../clients/client';
import {
  BitTableFields,
  BitTableFilter,
  BitTableSearchPayloadParams,
} from '../type/bitable';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class FeishuTableHelper {
  constructor(
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}

  async list(
    appToken: string,
    tableId: string,
    params: BitTableSearchPayloadParams = {},
  ) {
    return await this.client.client.bitable.appTableRecord.list({
      params,
      path: {
        app_token: appToken,
        table_id: tableId,
      },
    });
  }
  async search(appToken: string, tableId: string, filter: BitTableFilter) {
    return await this.client.client.bitable.appTableRecord.search({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      data: {
        filter,
      },
    });
  }
  async get(appToken: string, tableId: string, record_id: string) {
    return await this.client.client.bitable.appTableRecord.get({
      path: {
        app_token: appToken,
        table_id: tableId,
        record_id,
      },
    });
  }

  async create(appToken: string, tableId: string, records: BitTableFields) {
    return await this.client.client.bitable.appTableRecord.create({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      data: {
        fields: records,
      },
    });
  }
  async update(
    appToken: string,
    tableId: string,
    recordId: string,
    field: BitTableFields = {},
  ) {
    return await this.client.client.bitable.appTableRecord.update({
      path: {
        app_token: appToken,
        table_id: tableId,
        record_id: recordId,
      },
      data: {
        fields: field,
      },
    });
  }

  async delete(appToken: string, tableId: string, recordId: string) {
    return await this.client.client.bitable.appTableRecord.delete({
      path: {
        app_token: appToken,
        table_id: tableId,
        record_id: recordId,
      },
    });
  }
}

export default FeishuTableHelper;
