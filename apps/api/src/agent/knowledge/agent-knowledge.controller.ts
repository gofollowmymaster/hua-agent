import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import { AuthGuard } from '@src/common/guard/auth';
import { AgentKnowledgeService } from './agent-knowledge.service';
import {
  AgentKnowledgeChunkPageDto,
  AgentKnowledgeDocumentPageDto,
  AgentKnowledgeIngestDto,
  AgentKnowledgeSearchDto,
} from './dto/agent-knowledge.dto';

/** 提供业务 Agent 知识库的入库、检索和文档管理接口。 */
@ApiTags('业务 Agent 知识库')
@Controller('agent/knowledge')
@UseGuards(AuthGuard)
export class AgentKnowledgeController {
  constructor(private readonly agentKnowledgeService: AgentKnowledgeService) {}

  /** 扫描当前租户 docs 目录并触发知识库入库。 */
  @Post('ingest')
  @ApiOperation({ summary: '触发业务 Agent 知识库入库' })
  @ApiBody({ type: AgentKnowledgeIngestDto })
  ingest(@Body() body: AgentKnowledgeIngestDto) {
    return this.agentKnowledgeService.ingest(body);
  }

  /** 按全文、向量或混合模式检索当前租户知识库。 */
  @Post('search')
  @ApiOperation({ summary: '检索业务 Agent 知识库' })
  @ApiBody({ type: AgentKnowledgeSearchDto })
  search(@Body() body: AgentKnowledgeSearchDto) {
    return this.agentKnowledgeService.search(body);
  }

  /** 分页返回当前租户已入库的业务 Agent 文档。 */
  @Get('documents')
  @ApiOperation({ summary: '分页查询业务 Agent 知识库文档' })
  pageDocuments(@Query() query: AgentKnowledgeDocumentPageDto) {
    return this.agentKnowledgeService.pageDocuments(query);
  }

  /** 返回当前租户指定文档详情。 */
  @Get('documents/:id')
  @ApiOperation({ summary: '查询业务 Agent 知识库文档详情' })
  getDocument(@Param('id', ParseIntPipe) id: number) {
    return this.agentKnowledgeService.getDocument(id);
  }

  /** 分页返回当前租户指定文档的切片。 */
  @Post('documents/:id/chunks/page')
  @ApiOperation({ summary: '分页查询业务 Agent 知识库文档切片' })
  @ApiBody({ type: AgentKnowledgeChunkPageDto })
  pageDocumentChunks(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AgentKnowledgeChunkPageDto,
  ) {
    return this.agentKnowledgeService.pageDocumentChunks(id, body);
  }

  /** 以内联响应方式输出当前租户文档的原始 Markdown 文件。 */
  @Get('documents/:id/preview')
  @SkipTransform()
  @ApiOperation({ summary: '预览业务 Agent 知识库 Markdown 文档' })
  async previewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.agentKnowledgeService.getDocumentPreviewFile(id);
    response.set({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': this.buildInlineDisposition(file.fileName),
      'Content-Length': String(file.fileSize),
    });
    return new StreamableFile(createReadStream(file.absolutePath));
  }

  /** 删除当前租户指定文档及其索引。 */
  @Delete('documents/:id')
  @ApiOperation({ summary: '删除业务 Agent 知识库文档' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.agentKnowledgeService.deleteDocument(id);
  }

  /** 构造兼容 ASCII 回退名称和 UTF-8 文件名的内联响应头。 */
  private buildInlineDisposition(fileName: string) {
    const fallback = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
    return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }
}
