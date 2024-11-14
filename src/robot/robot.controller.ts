import {
  Body,
  Controller,
  Post,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RobotService } from './robot.service';
import { MessageFromRobotDto } from './dto/post-message-from-robot.dto';
@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post('getList')
  async getList(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.getList(MessageFromRobot, {
        appToken,
        tableId,
      });
      return res;
    } else {
      throw new HttpException(
        'headers中需要填写appToken和tableId',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('createRecord')
  async createRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.createRecord(MessageFromRobot, {
        appToken,
        tableId,
      });
      return res;
    } else {
      throw new HttpException(
        'headers中需要填写appToken和tableId',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
