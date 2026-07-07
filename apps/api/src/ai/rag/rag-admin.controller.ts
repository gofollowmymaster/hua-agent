import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { AuthGuard } from '@src/common/guard/auth';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import {
  RagAdminDocumentChunkPageDto,
  RagAdminDocumentMetadataDto,
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

  @Post('documents/:id/metadata')
  @ApiOperation({ summary: '更新 RAG 文档元数据' })
  @ApiBody({ type: RagAdminDocumentMetadataDto })
  updateDocumentMetadata(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RagAdminDocumentMetadataDto,
  ) {
    return this.ragAdminService.updateDocumentMetadata(id, body);
  }

  @Post('documents/:id/chunks/page')
  @ApiOperation({ summary: '分页查询 RAG 文档切片' })
  @ApiBody({ type: RagAdminDocumentChunkPageDto })
  pageDocumentChunks(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RagAdminDocumentChunkPageDto,
  ) {
    return this.ragAdminService.pageDocumentChunks(id, body);
  }

  @Get('documents/:id/preview')
  @SkipTransform()
  @ApiOperation({ summary: '预览 RAG 文档原始文件' })
  async previewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.ragAdminService.getDocumentPreviewFile(id);
    response.set({
      'Content-Type': this.resolveMimeType(file.fileType),
      'Content-Disposition': this.buildInlineDisposition(file.fileName),
      'Content-Length': String(file.fileSize),
    });

    return new StreamableFile(createReadStream(file.absolutePath));
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

  private resolveMimeType(fileType: string) {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain; charset=utf-8',
      md: 'text/markdown; charset=utf-8',
    };

    return mimeTypes[fileType.toLowerCase()] ?? 'application/octet-stream';
  }

  private buildInlineDisposition(fileName: string) {
    const fallback = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
    return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }
}
