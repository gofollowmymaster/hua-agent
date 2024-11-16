import {
  Body,
  Controller,
  Post,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RobotService } from './robot.service';
import {
  MessageFromRobotDto,
  SearchParamsDto,
} from './dto/post-message-from-robot.dto';
@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}
  //列出表格记录
  @Post('getRecord')
  async getList(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.getList({
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
    @Body() SearchParams: Pick<SearchParamsDto, 'records'>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.createRecord(SearchParams, {
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
    @Body() SearchParams: Pick<SearchParamsDto, 'data'>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.searchRecord(SearchParams, {
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
    @Body() SearchParams: Pick<SearchParamsDto, 'record_id' | 'records'>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.updateRecord(SearchParams, {
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
    @Body() SearchParams: Pick<SearchParamsDto, 'record_id'>,
  ) {
    if (appToken && tableId) {
      const res = await this.robotService.deleteRecord(SearchParams, {
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
  @Post('feishuFlowMessage')
  async feishuFlowMessage(@Body() MessageFromRobotDto: MessageFromRobotDto) {
    return MessageFromRobotDto;
  }
}
