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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
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
import { RagDocumentUploadService } from './services/ingest/rag-document-upload.service';

const MAX_UPLOAD_FILES = 20;
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;

/** 提供 RAG 管理后台的文档、索引和会话 HTTP 接口。 */
@ApiTags('RAG 管理后台')
@UseGuards(AuthGuard)
@Controller('ai/rag/admin')
export class RagAdminController {
  constructor(
    private readonly ragAdminService: RagAdminService,
    private readonly ragDocumentUploadService: RagDocumentUploadService,
  ) {}

  /** 按管理端筛选条件分页查询知识库文档。 */
  @Post('documents/page')
  @ApiOperation({ summary: '分页查询 RAG 文档' })
  @ApiBody({ type: RagAdminDocumentPageDto })
  pageDocuments(@Body() body: RagAdminDocumentPageDto) {
    return this.ragAdminService.pageDocuments(body);
  }

  /** 接收批量文档上传并交由上传服务完成持久化和索引。 */
  @Post('documents/upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_UPLOAD_FILES, {
      storage: diskStorage({
        destination: tmpdir(),
        filename: (_request, _file, callback) => callback(null, randomUUID()),
      }),
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE, files: MAX_UPLOAD_FILES },
    }),
  )
  @ApiOperation({ summary: '批量上传并索引 RAG 文档' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          maxItems: MAX_UPLOAD_FILES,
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  uploadDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    return this.ragDocumentUploadService.uploadDocuments(files);
  }

  /** 删除当前租户指定文档及其索引。 */
  @Delete('documents/:id')
  @ApiOperation({ summary: '删除 RAG 文档索引' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.ragAdminService.deleteDocument(id);
  }

  /** 更新指定知识库文档的业务分类和标签。 */
  @Post('documents/:id/metadata')
  @ApiOperation({ summary: '更新 RAG 文档元数据' })
  @ApiBody({ type: RagAdminDocumentMetadataDto })
  updateDocumentMetadata(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RagAdminDocumentMetadataDto,
  ) {
    return this.ragAdminService.updateDocumentMetadata(id, body);
  }

  /** 分页返回指定文档的切片内容。 */
  @Post('documents/:id/chunks/page')
  @ApiOperation({ summary: '分页查询 RAG 文档切片' })
  @ApiBody({ type: RagAdminDocumentChunkPageDto })
  pageDocumentChunks(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RagAdminDocumentChunkPageDto,
  ) {
    return this.ragAdminService.pageDocumentChunks(id, body);
  }

  /** 以内联响应方式输出指定文档的原始文件。 */
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

  /** 从租户原始文档目录触发一次索引任务。 */
  @Post('ingest')
  @ApiOperation({ summary: '触发 RAG 文档索引' })
  @ApiBody({ type: RagAdminIngestDto })
  ingest(@Body() body: RagAdminIngestDto) {
    return this.ragAdminService.ingest(body);
  }

  /** 按管理端筛选条件分页查询问答会话。 */
  @Post('sessions/page')
  @ApiOperation({ summary: '分页查询 RAG 会话' })
  @ApiBody({ type: RagAdminSessionPageDto })
  pageSessions(@Body() body: RagAdminSessionPageDto) {
    return this.ragAdminService.pageSessions(body);
  }

  /** 返回指定会话按时间排序的完整消息记录。 */
  @Get('sessions/:id/messages')
  @ApiOperation({ summary: '查询 RAG 会话消息详情' })
  listSessionMessages(@Param('id', ParseIntPipe) id: number) {
    return this.ragAdminService.listSessionMessages(id);
  }

  /** 根据文档扩展类型选择适合浏览器预览的 MIME 类型。 */
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

  /** 构造兼容 ASCII 回退名称和 UTF-8 文件名的内联响应头。 */
  private buildInlineDisposition(fileName: string) {
    const fallback = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
    return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }
}
