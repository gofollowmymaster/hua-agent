import { Injectable } from '@nestjs/common';
import {
  SearchParamsDto,
  MessageFromRobotDto,
} from './dto/post-message-from-robot.dto';
import { listTableRecord } from '../utils/actionTable/listTableRecord';
import { addTableRecord } from '../utils/actionTable/addTableRecord';
import { searchTableRecord } from '../utils/actionTable/searchTableRecord';
import { updateTableRecord } from '../utils/actionTable/updateTableRecord';
import { deleteTableRecord } from '../utils/actionTable/deleteTableRecord';
import { feishuSence01Service } from './logic/feishu.sence01.service';
@Injectable()
export class RobotService {
  constructor(private readonly feishuSence01: feishuSence01Service) {}
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

  async feishuFlowMessage(
    MessageFromRobot: MessageFromRobotDto,
    headers: { appToken: string; tableId: string },
  ) {
    // 场景 1 @小A 这是一个问题 但消息内容上无引用内容 则认为为这是一个需要记录的问题
    const res = await this.feishuSence01.run(MessageFromRobot, headers);
    // 场景 2 使用引用消息 @小A 但是@小A后无内容 则同样认为为这是一个需要记录的问题
    // 场景 3 使用引用消息 @小A 但是@小A后有内容 则认为为这是一个需要记录的回复（“引用消息”就作为本次回复内容，需要去表里面查找是否有对应的问题）
    return res;
  }
}
