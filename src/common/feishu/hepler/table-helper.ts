import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject } from '@nestjs/common';

class FeishuTableHelper {
  constructor(
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}
  async create(appToken, tableId, records) {
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
  async list(appToken, tableId, params = {}) {
    return await this.client.client.bitable.appTableRecord.list({
      params,
      path: {
        app_token: appToken,
        table_id: tableId,
      },
    });
  }
}

export default FeishuTableHelper;
