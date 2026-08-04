import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { pipeUIMessageStreamToResponse } from 'ai';
import { catchError, from, map, Observable, of } from 'rxjs';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import { RagIngestDto } from './dto/ingest.dto';
import { RagQueryDto } from './dto/query.dto';
import { RagService, type RagChatRequest } from './rag.service';
import { RagDocumentService } from './services/rag-document.service';
import { RagIngestService } from './services/ingest/rag-ingest.service';
import { AuthGuard } from '@src/common/guard/auth';
import type { RagQueryOptions } from './types/rag.type';

/** 提供知识库索引、问答和文档管理的 HTTP 接口。 */
@ApiTags('RAG 企业知识库')
@Controller('ai/rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ragIngestService: RagIngestService,
    private readonly ragDocumentService: RagDocumentService,
  ) {}

  /** 扫描租户原始文档目录并触发索引。 */
  @Post('ingest')
  @ApiOperation({ summary: '扫描 raw 目录并索引 RAG 文档' })
  @ApiBody({ type: RagIngestDto })
  @UseGuards(AuthGuard)
  ingest(@Body() body: RagIngestDto) {
    return this.ragIngestService.ingest({ force: Boolean(body?.force) });
  }

  /** 执行一次同步知识库问答。 */
  @Post('query')
  @ApiOperation({ summary: 'RAG 同步问答' })
  @ApiBody({ type: RagQueryDto })
  query(@Body() body: RagQueryDto) {
    return this.ragService.answerQuestion(
      body.question,
      this.buildQueryOptions(body),
    );
  }

  /** 将 AGUI 聊天请求适配为 UI Message 流并写入 HTTP 响应。 */
  @SkipTransform()
  @Post('chat')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'AGUI 协议 RAG 问答' })
  chat(
    @Body() body: RagChatRequest,
    @Res({ passthrough: false }) res: Response,
  ) {
    const stream = this.ragService.createChatStream(body ?? {});
    pipeUIMessageStreamToResponse({
      response: res,
      stream,
    });
  }

  /** 通过 SSE 持续推送问答状态、推理内容和答案。 */
  @SkipTransform()
  @Sse('query/stream')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Header('X-Accel-Buffering', 'no')
  @ApiOperation({ summary: 'RAG SSE 流式问答' })
  queryStream(
    @Query('question') question: string,
    @Query('topK') topK?: string,
    @Query('conversationId') conversationId?: string,
    @Query('conversationType') conversationType?: string,
    @Query('participantId') participantId?: string,
  ): Observable<MessageEvent> {
    const parsedTopK = topK ? Number(topK) : undefined;
    return from(
      this.ragService.streamAnswer(question, {
        topK: parsedTopK,
        session: {
          channel: 'http',
          conversationId,
          conversationType,
          participantId,
        },
      }),
    ).pipe(
      map((event) => ({ type: event.type, data: event.data })),
      catchError((error) =>
        of({
          type: 'error',
          data: {
            message: error instanceof Error ? error.message : String(error),
          },
        }),
      ),
    );
  }

  /** 将查询 DTO 转换为工作流使用的检索与会话选项。 */
  private buildQueryOptions(body: RagQueryDto): RagQueryOptions {
    return {
      topK: body.topK,
      session: {
        channel: 'http',
        conversationId: body.conversationId,
        conversationType: body.conversationType,
        participantId: body.participantId,
        metadata: body.metadata,
      },
    };
  }

  /** 返回当前租户已经建立索引的文档。 */
  @Get('documents')
  @ApiOperation({ summary: '获取 RAG 已索引文档列表' })
  documents() {
    return this.ragDocumentService.listDocuments();
  }

  /** 删除当前租户指定文档及其索引数据。 */
  @Delete('documents/:id')
  @ApiOperation({ summary: '删除 RAG 已索引文档' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.ragDocumentService.deleteDocument(id);
  }
}
