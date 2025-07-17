import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CacheService } from './cache.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import { CacheClearDto } from './dto/cache-clear.dto';

@ApiTags('缓存管理')
@Controller('admin/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @ApiOperation({
    summary: '清理缓存',
    description: '清理缓存指定缓存信息',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(AuthGuard)
  @ApiBody({
    type: CacheClearDto,
  })
  @Post('clearCache')
  async clearCache(@Body() params: CacheClearDto) {
    //发送消息
    return await this.cacheService.clearCache(params);
  }
}
