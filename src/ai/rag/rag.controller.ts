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
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { catchError, from, map, Observable, of } from 'rxjs';
import { SkipTransform } from '@src/common/decorator/skip-transform.decorator';
import { RagIngestDto } from './dto/ingest.dto';
import { RagQueryDto } from './dto/query.dto';
import { RagService } from './rag.service';
import { RagDocumentService } from './services/rag-document.service';
import { RagIngestService } from './services/rag-ingest.service';
import { AuthGuard } from '@src/common/guard/auth';

@ApiTags('RAG 企业知识库')
@Controller('ai/rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ragIngestService: RagIngestService,
    private readonly ragDocumentService: RagDocumentService,
  ) {}

  @Post('ingest')
  @ApiOperation({ summary: '扫描 raw 目录并索引 RAG 文档' })
  @ApiBody({ type: RagIngestDto })
  @UseGuards(AuthGuard)
  ingest(@Body() body: RagIngestDto) {
    return this.ragIngestService.ingest({ force: Boolean(body?.force) });
  }

  @Post('query')
  @ApiOperation({ summary: 'RAG 同步问答' })
  @ApiBody({ type: RagQueryDto })
  query(@Body() body: RagQueryDto) {
    return this.ragService.answerQuestion(body.question, body.topK);
  }

  @SkipTransform()
  @Sse('query/stream')
  @Header('Cache-Control', 'no-cache, no-transform')
  @Header('X-Accel-Buffering', 'no')
  @ApiOperation({ summary: 'RAG SSE 流式问答' })
  queryStream(
    @Query('question') question: string,
    @Query('topK') topK?: string,
  ): Observable<MessageEvent> {
    const parsedTopK = topK ? Number(topK) : undefined;
    return from(this.ragService.streamAnswer(question, parsedTopK)).pipe(
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

  @Get('documents')
  @ApiOperation({ summary: '获取 RAG 已索引文档列表' })
  documents() {
    return this.ragDocumentService.listDocuments();
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: '删除 RAG 已索引文档' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.ragDocumentService.deleteDocument(id);
  }
}
