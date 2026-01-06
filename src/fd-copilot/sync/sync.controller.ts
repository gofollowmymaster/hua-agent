import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeishuDocumentContentDto, FeishuPushDto } from './dto/sync';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';

@Controller('sync')
@ApiTags('同步文档到飞书知识库')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('upDocument')
  @ApiOperation({
    summary: '上传文档到飞书知识库',
    description: '上传文档到飞书知识库',
  })
  @ApiBody({ type: FeishuPushDto })
  @UseGuards(SecretAuthGuard)
  async pushDocument(@Body() params: FeishuPushDto) {
    return this.syncService.pushDocument(params);
  }
  @Post('getDocumentContent')
  @ApiOperation({
    summary: '获取原始文档',
    description: '获取原始文档',
  })
  @ApiBody({ type: FeishuDocumentContentDto })
  @UseGuards(SecretAuthGuard)
  async getDocumentContent(@Body() params: FeishuDocumentContentDto) {
    return this.syncService.getDocumentContent(params);
  }
}
