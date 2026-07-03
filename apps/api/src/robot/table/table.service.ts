import { Injectable } from '@nestjs/common';

import FeishuTableHelper from '@src/common/feishu/helper/table-helper';
import {
  BatchDeleteParamsDto,
  CreateRecordParamsDto,
  DeleteRecordParamsDto,
  SearchParamsDto,
  TableHeaderType,
  UpdateRecordParamsDto,
} from '../dto/table-action.dto';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RedisService } from '@src/common/service/redis/redis.service';
type TableHelperMap = Record<FeishuApp, FeishuTableHelper>;
@Injectable()
export class TableService {
  private readonly tableHelperMap: TableHelperMap = {} as TableHelperMap;
  constructor(
    private readonly userContext: TenantContext,
    private readonly redisServer: RedisService,
  ) {}
  getTableHelper(robotName: FeishuApp = FeishuApp.XiaoAClient) {
    if (!robotName) robotName = FeishuApp.XiaoAClient;
    if (!this.tableHelperMap[robotName]) {
      this.tableHelperMap[robotName] = new FeishuTableHelper(
        ClientFactory.create(robotName),
        this.userContext,
        this.redisServer,
      );
    }
    return this.tableHelperMap[robotName];
  }
  async getList({ appToken, tableId, robotName }: TableHeaderType) {
    const tableHelper = this.getTableHelper(robotName);

    const res = await tableHelper
      .setTableOption({
        appToken,
        tableId,
        useCache: false,
      })
      .list();
    return res;
  }

  async createRecord(
    SearchParams: CreateRecordParamsDto,
    { appToken, tableId, robotName }: TableHeaderType,
  ) {
    const { records } = SearchParams;

    const tableHelper = this.getTableHelper(robotName);

    const res = await tableHelper
      .setTableOption({
        appToken,
        tableId,
      })
      .create(records);
    return res;
  }

  async searchRecord(
    SearchParams: Partial<SearchParamsDto>,
    { appToken, tableId, robotName }: TableHeaderType,
  ) {
    const { filter } = SearchParams;
    const tableHelper = this.getTableHelper(robotName);

    const res = await tableHelper
      .setTableOption({
        appToken,
        tableId,
        useCache: false,
      })
      .search({ filter });
    return res;
  }

  async updateRecord(
    params: UpdateRecordParamsDto,
    { appToken, tableId, robotName }: TableHeaderType,
  ) {
    const { recordId, data } = params;
    const tableHelper = this.getTableHelper(robotName);

    const res = await tableHelper
      .setTableOption({
        appToken,
        tableId,
      })
      .update(recordId, data);
    return res;
  }

  async deleteRecord(
    SearchParams: DeleteRecordParamsDto,
    { appToken, tableId, robotName }: TableHeaderType,
  ) {
    const { recordId } = SearchParams;
    const tableHelper = this.getTableHelper(robotName);

    const res = await tableHelper
      .setTableOption({
        appToken,
        tableId,
      })
      .delete(recordId);
    return res;
  }
  async batchDeleteRecord(
    params: BatchDeleteParamsDto,
    { appToken, tableId, robotName }: TableHeaderType,
  ) {
    const { recordIds } = params;
    const tableHelper = this.getTableHelper(robotName);

    tableHelper.setTableOption({
      appToken,
      tableId,
    });
    const res = await tableHelper.batchDelete(recordIds);
    return res;
  }
}
