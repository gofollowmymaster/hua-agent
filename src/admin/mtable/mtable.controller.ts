import { Controller, Post, UseGuards } from '@nestjs/common';

import { MtableService } from './mtable.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';

@ApiTags('多维表格管理中心')
@Controller('admin/mtable')
export class MtableController {
  constructor(private readonly mtableService: MtableService) {}

  @ApiOperation({
    summary: '列出所有多为表格',
    description: '列出Aplus Node server使用到的所有多维表格',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(AuthGuard)
  @Post('list')
  async list() {
    //发送消息
    return await this.mtableService.list();
  }

  @ApiOperation({
    summary: '业务线列表',
    description: '飞书业务线列表信息',
  })
  @Post('business-line')
  async aplusBussnessList() {
    // 添加到多维表格
    return await this.mtableService.aplusBussnessList();
  }
}
