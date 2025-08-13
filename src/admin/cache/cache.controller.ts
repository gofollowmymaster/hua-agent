import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CacheService } from './cache.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheClearDto, CacheGetDto } from './dto/cache-clear.dto';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';

@ApiTags('缓存管理')
@Controller('admin/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @ApiOperation({
    summary: '清理缓存',
    description: '根据指定key清理缓存指定缓存信息',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(SecretAuthGuard)
  @ApiBody({
    type: CacheClearDto,
  })
  @Post('delCache')
  async delCache(@Body() params: CacheClearDto) {
    //发送消息
    return await this.cacheService.delCache(params);
  }
  @ApiOperation({
    summary: '获取缓存信息',
    description: '根据指定key获取缓存信息',
  })
  @ApiOkResponse({
    description: 'success',
    type: String,
  })
  @UseGuards(SecretAuthGuard)
  @ApiBody({
    type: CacheGetDto,
  })
  @Post('getCache')
  async getCache(@Body() params: CacheGetDto) {
    //发送消息
    return await this.cacheService.getCache(params);
  }
}
