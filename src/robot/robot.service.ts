import { Injectable } from '@nestjs/common';
import { MessageFromRobotDto } from './dto/post-message-from-robot.dto';
import { checkTableRecord } from '../utils/actionTable/checkTableRecord';
import { addTableRecord } from '../utils/actionTable/addTableRecord';
@Injectable()
export class RobotService {
  async getList(
    MessageFromRobot: Partial<MessageFromRobotDto>,
    headers: { appToken: string; tableId: string },
  ) {
    const { appToken, tableId } = headers;
    const res = await checkTableRecord(appToken, tableId);
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
}
