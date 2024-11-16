import { Injectable } from '@nestjs/common';
import { SearchParamsDto } from './dto/post-message-from-robot.dto';
import { listTableRecord } from '../utils/actionTable/listTableRecord';
import { addTableRecord } from '../utils/actionTable/addTableRecord';
import { searchTableRecord } from '../utils/actionTable/searchTableRecord';
import { updateTableRecord } from '../utils/actionTable/updateTableRecord';
import { deleteTableRecord } from '../utils/actionTable/deleteTableRecord';
@Injectable()
export class RobotService {
  async getList(headers: { appToken: string; tableId: string }) {
    const { appToken, tableId } = headers;
    const res = await listTableRecord(appToken, tableId);
    return res;
  }

  async createRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await addTableRecord(appToken, tableId, records);
    return res;
  }

  async searchRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { data } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await searchTableRecord(appToken, tableId, data);
    return res;
  }

  async updateRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id, records } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await updateTableRecord(appToken, tableId, record_id, records);
    return res;
  }

  async deleteRecord(
    SearchParams: Partial<SearchParamsDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id } = SearchParams;
    const { appToken, tableId } = headers;
    const res = await deleteTableRecord(appToken, tableId, record_id);
    return res;
  }
}
