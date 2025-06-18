import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class FeishuTableHelper {
  constructor(
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}
  async create(appToken: string, tableId: string, records) {
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
  async list(appToken: string, tableId: string, params = {}) {
    return await this.client.client.bitable.appTableRecord.list({
      params,
      path: {
        app_token: appToken,
        table_id: tableId,
      },
    });
  }
  async search(appToken: string, tableId: string, filter = {}) {
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
  async update(
    appToken: string,
    tableId: string,
    recordId: string,
    field = {},
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
}

export default FeishuTableHelper;
