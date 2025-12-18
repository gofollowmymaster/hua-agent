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
  SearchParamsDto,
  TableHeaderType,
  TableRecordId,
  TableRecords,
  TableRecordsOrId,
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
@ApiTags('飞书多维表格快捷操作')
@ApiHeaders([
  {
    name: 'appToken',
    description: '多维表格appToken',
  },
  {
    name: 'tableId',
    description: '多维表格tableId',
  },
])
@Controller('robot')
export class TableController {
  constructor(private readonly tableService: TableService) {}
  checkHeader({ appToken, tableId }: TableHeaderType) {
    if (!appToken || !tableId) {
      throw new HttpException(
        'headers中需要填写appToken和tableId',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
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
    const header = {
      appToken,
      tableId,
    };
    this.checkHeader(header);

    const res = await this.tableService.getList(header);
    return res;
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
    const header = {
      appToken,
      tableId,
    };
    this.checkHeader(header);

    const res = await this.tableService.createRecord(SearchParams, header);
    return res;
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
    const header = {
      appToken,
      tableId,
    };
    this.checkHeader(header);

    const res = await this.tableService.searchRecord(SearchParams, header);
    return res;
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
    const header = {
      appToken,
      tableId,
    };
    this.checkHeader(header);

    const res = await this.tableService.updateRecord(SearchParams, header);
    return res;
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
    const header = {
      appToken,
      tableId,
    };
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
  @UseGuards(SecretAuthGuard)
  @Post('batch-delete')
  async batchDeleteRecord(
    @Headers('appToken') appToken: string,
    @Headers('tableId') tableId: string,
    @Body() params: BatchDeleteParamsDto,
  ) {
    const header = {
      appToken,
      tableId,
    };
    this.checkHeader(header);
    const res = await this.tableService.batchDeleteRecord(params, header);
    return res;
  }
}
