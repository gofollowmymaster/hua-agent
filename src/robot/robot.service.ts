import { Injectable } from '@nestjs/common';
import { MessageFromRobotDto } from './dto/post-message-from-robot.dto';
import { listTableRecord } from '../utils/actionTable/listTableRecord';
import { addTableRecord } from '../utils/actionTable/addTableRecord';
import { searchTableRecord } from '../utils/actionTable/searchTableRecord';
import { updateTableRecord } from '../utils/actionTable/updateTableRecord';
import { deleteTableRecord } from '../utils/actionTable/deleteTableRecord';
@Injectable()
export class RobotService {
  async getList(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { appToken, tableId } = headers;
    const res = await listTableRecord(appToken, tableId);
    return res;
  }

  async createRecord(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { records } = MessageFromRobot;
    const { appToken, tableId } = headers;
    const res = await addTableRecord(appToken, tableId, records);
    return res;
  }

  async searchRecord(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { data } = MessageFromRobot;
    const { appToken, tableId } = headers;
    const res = await searchTableRecord(appToken, tableId, data);
    return res;
  }

  async updateRecord(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id, records } = MessageFromRobot;
    const { appToken, tableId } = headers;
    const res = await updateTableRecord(appToken, tableId, record_id, records);
    return res;
  }

  async deleteRecord(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { record_id } = MessageFromRobot;
    const { appToken, tableId } = headers;
    const res = await deleteTableRecord(appToken, tableId, record_id);
    return res;
  }
}
