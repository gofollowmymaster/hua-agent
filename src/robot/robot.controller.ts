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
  //列出表格记录
  @Post('getRecord')
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
  //创建表格记录
  @Post('createRecord')
  async createRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    console.log(tableId);
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
  //查询表格记录
  @Post('searchRecord')
  async searchRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.searchRecord(MessageFromRobot, {
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
  //查询表格记录
  @Post('updateRecord')
  async updateRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.updateRecord(MessageFromRobot, {
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
  //删除表格记录
  @Post('deleteRecord')
  async deleteRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: Partial<MessageFromRobotDto>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.deleteRecord(MessageFromRobot, {
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
