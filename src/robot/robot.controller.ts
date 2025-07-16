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
  FeishuMessageSenderDto,
  FeishuTicketDto,
  MessageFromRobotDto,
  SearchParamsDto,
  TableRecordId,
  TableRecords,
  TableRecordsOrId,
} from './dto/post-message-from-robot.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { records } from '@utils/actionTable/interface';
import { AplusResponse } from '@src/type/global';
@ApiTags('飞书机器人快捷操作')
// @ApiHeaders([
//   {
//     name: 'appToken',
//     description: '多维表格appToken',
//   },
//   {
//     name: 'tableId',
//     description: '多维表格appToken',
//   },
// ])
@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @ApiOperation({
    summary: '列出表格记录',
    description: '列出表格记录',
  })
  @ApiOkResponse({ type: AplusResponse<records[]> })
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
  @ApiOperation({
    summary: '创建表格记录',
    description: '创建表格记录',
  })
  @ApiBody({ type: TableRecords })
  @ApiCreatedResponse({ type: AplusResponse<records> })
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
  @ApiOperation({
    summary: '查询表格记录',
    description: '查询表格记录',
  })
  // @ApiBody({ type:   })
  @ApiOkResponse({ type: AplusResponse<records[]> })
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

  @ApiOperation({
    summary: '修改表格记录',
    description: '修改表格记录',
  })
  @ApiBody({
    type: TableRecordsOrId,
  })
  @ApiOkResponse({ type: AplusResponse<records[]> })
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
  @ApiOperation({
    summary: '删除表格记录',
    description: '删除表格记录',
  })
  @ApiBody({ type: TableRecordId })
  @ApiOkResponse({ type: AplusResponse<records> })
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
  //回复飞书消息
  @ApiOperation({
    summary: '回复飞书消息',
    description: '回复飞书消息',
  })
  @ApiBody({ type: MessageFromRobotDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('feishuFlowMessage')
  async feishuFlowMessage(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() MessageFromRobot: MessageFromRobotDto,
  ) {
    const res = await this.robotService.feishuFlowMessage(MessageFromRobot, {
      appToken,
      tableId,
    });
    return res;
  }

  //通用发送飞书消息
  @ApiOperation({
    summary: '通用发送飞书消息',
    description:
      '通用发送飞书消息到任何群,消息体需遵循飞书结构，具体参见文档:https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json',
  })
  @ApiBody({ type: FeishuMessageSenderDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('sendFeishuMessage')
  async sendFeishuMessage(@Body() MessageFromRobot: FeishuMessageSenderDto) {
    const res = await this.robotService.sendFeishuMessage(MessageFromRobot);
    return res;
  }

  // 通用机器人获取Ticket
  @ApiOperation({
    summary: '通用机器人获取Ticket',
    description: '通用机器人获取Ticket',
  })
  @ApiBody({ type: FeishuTicketDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('getTicket')
  async getTicket(@Body() params: FeishuTicketDto) {
    const res = await this.robotService.getTicket(params);
    return res;
  }
}
