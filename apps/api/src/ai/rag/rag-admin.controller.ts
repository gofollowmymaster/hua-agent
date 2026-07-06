import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@src/common/guard/auth';
import {
  RagAdminDocumentPageDto,
  RagAdminIngestDto,
  RagAdminSessionPageDto,
} from './dto/rag-admin.dto';
import { RagAdminService } from './services/rag-admin.service';

@ApiTags('RAG 管理后台')
@UseGuards(AuthGuard)
@Controller('ai/rag/admin')
export class RagAdminController {
  constructor(private readonly ragAdminService: RagAdminService) {}

  @Post('documents/page')
  @ApiOperation({ summary: '分页查询 RAG 文档' })
  @ApiBody({ type: RagAdminDocumentPageDto })
  pageDocuments(@Body() body: RagAdminDocumentPageDto) {
    return this.ragAdminService.pageDocuments(body);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: '删除 RAG 文档索引' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.ragAdminService.deleteDocument(id);
  }

  @Post('ingest')
  @ApiOperation({ summary: '触发 RAG 文档索引' })
  @ApiBody({ type: RagAdminIngestDto })
  ingest(@Body() body: RagAdminIngestDto) {
    return this.ragAdminService.ingest(body);
  }

  @Post('sessions/page')
  @ApiOperation({ summary: '分页查询 RAG 会话' })
  @ApiBody({ type: RagAdminSessionPageDto })
  pageSessions(@Body() body: RagAdminSessionPageDto) {
    return this.ragAdminService.pageSessions(body);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: '查询 RAG 会话消息详情' })
  listSessionMessages(@Param('id', ParseIntPipe) id: number) {
    return this.ragAdminService.listSessionMessages(id);
  }
}
