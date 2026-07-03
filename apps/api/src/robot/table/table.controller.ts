import {
  Body,
  Controller,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';

import {
  BatchDeleteParamsDto,
  CreateRecordParamsDto,
  DeleteRecordParamsDto,
  SearchParamsDto,
  TableHeaderType,
  UpdateRecordParamsDto,
} from '../dto/table-action.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeaders,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { records } from '@src/common/utils/actionTable/interface';
import { AplusResponse } from '@src/type/global';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { FeishuApp } from '@src/common/feishu/clients';
@ApiTags('飞书多维表格快捷操作')
@ApiHeaders([
  {
    name: 'appToken',
    required: true,
    description: '多维表格appToken',
  },
  {
    name: 'tableId',
    required: true,
    description: '多维表格tableId',
  },
  {
    name: 'robotName',
    enum: FeishuApp,
    description: '飞书机器人',
  },
])
@UseGuards(SecretAuthGuard)
@Controller('robot')
export class TableController {
  constructor(private readonly tableService: TableService) {}
  checkHeader(header: TableHeaderType) {
    const {
      apptoken: appToken,
      tableid: tableId,
      robotname: robotName = FeishuApp.XiaoAClient,
    } = header;
    //获取的header都是小写需要转换成驼峰
    header.appToken = appToken;
    header.tableId = tableId;
    header.robotName = robotName as FeishuApp;
    if (!appToken || !tableId) {
      throw new HttpException(
        'headers中需要填写appToken和tableId',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (robotName && !FeishuApp[robotName]) {
      throw new HttpException('非法的机器人', HttpStatus.BAD_REQUEST);
    }
  }
  @ApiOperation({
    summary: '列出表格记录',
    description: '列出表格记录',
  })
  @ApiOkResponse({ type: AplusResponse<records[]> })
  @Post('getRecord')
  async getList(@Headers() header: TableHeaderType) {
    this.checkHeader(header);

    const res = await this.tableService.getList(header);
    return res;
  }
  @ApiOperation({
    summary: '创建表格记录',
    description: '创建表格记录',
  })
  @ApiBody({ type: CreateRecordParamsDto })
  @ApiCreatedResponse({ type: AplusResponse<records> })
  @Post('createRecord')
  async createRecord(
    @Headers() header: TableHeaderType,
    @Body() params: CreateRecordParamsDto,
  ) {
    this.checkHeader(header);

    const res = await this.tableService.createRecord(params, header);
    return res;
  }
  @ApiOperation({
    summary: '查询表格记录',
    description: '查询表格记录',
  })
  @ApiBody({ type: SearchParamsDto })
  @ApiOkResponse({ type: AplusResponse<records[]> })
  @Post('searchRecord')
  async searchRecord(
    @Headers() header: TableHeaderType,
    @Body() SearchParams: SearchParamsDto,
  ) {
    this.checkHeader(header);

    const res = await this.tableService.searchRecord(SearchParams, header);
    return res;
  }

  @ApiOperation({
    summary: '修改表格记录',
    description: '修改表格记录',
  })
  @ApiBody({
    type: UpdateRecordParamsDto,
  })
  @ApiOkResponse({ type: AplusResponse<records[]> })
  @Post('updateRecord')
  async updateRecord(
    @Headers() header: TableHeaderType,
    @Body() params: UpdateRecordParamsDto,
  ) {
    this.checkHeader(header);

    const res = await this.tableService.updateRecord(params, header);
    return res;
  }

  @ApiOperation({
    summary: '删除表格记录',
    description: '删除表格记录',
  })
  @ApiBody({ type: DeleteRecordParamsDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('deleteRecord')
  async deleteRecord(
    @Headers() header: TableHeaderType,
    @Body() SearchParams: DeleteRecordParamsDto,
  ) {
    this.checkHeader(header);
    const res = await this.tableService.deleteRecord(SearchParams, header);
    return res;
  }

  @ApiOperation({
    summary: '批量删除表格记录',
    description: '批量删除表格记录',
  })
  @ApiBody({ type: BatchDeleteParamsDto })
  @ApiOkResponse({ type: AplusResponse<records> })
  @Post('batch-delete')
  async batchDeleteRecord(
    @Headers() header: TableHeaderType,
    @Body() params: BatchDeleteParamsDto,
  ) {
    this.checkHeader(header);
    const res = await this.tableService.batchDeleteRecord(params, header);
    return res;
  }
}
