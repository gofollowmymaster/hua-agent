import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupplierDiffService } from './supplier-diff.service';
import { SupplierDiffDto } from './dto/supplier-diff.dto';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';

@ApiTags('服务商差异化信息接口')
@Controller('supplier-diff')
export class SupplierDiffController {
  constructor(private readonly supplierDiffService: SupplierDiffService) {}

  @ApiOperation({
    summary: '获取服务商差异化信息',
    description: '按照过滤条件查询所有服务商差异化信息',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(SecretAuthGuard)
  @Post('/list')
  @ApiBody({ type: SupplierDiffDto })
  async list(@Body() params: SupplierDiffDto) {
    return await this.supplierDiffService.list(params);
  }
}
