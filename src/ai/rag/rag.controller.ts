import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { from, map, Observable } from 'rxjs';
import { RagIngestDto } from './dto/ingest.dto';
import { RagQueryDto } from './dto/query.dto';
import { RagService } from './rag.service';

@ApiTags('RAG 企业知识库')
@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  @ApiOperation({ summary: '扫描 raw 目录并索引 RAG 文档' })
  @ApiBody({ type: RagIngestDto })
  ingest(@Body() body: RagIngestDto) {
    return this.ragService.ingest({ force: Boolean(body?.force) });
  }

  @Post('query')
  @ApiOperation({ summary: 'RAG 同步问答' })
  @ApiBody({ type: RagQueryDto })
  query(@Body() body: RagQueryDto) {
    return this.ragService.answerQuestion(body.question, body.topK);
  }

  @Sse('query/stream')
  @ApiOperation({ summary: 'RAG SSE 流式问答' })
  queryStream(
    @Query('question') question: string,
    @Query('topK') topK?: string,
  ): Observable<{ data: string }> {
    const parsedTopK = topK ? Number(topK) : undefined;
    return from(this.ragService.streamAnswer(question, parsedTopK)).pipe(
      map((chunk) => ({ data: chunk })),
    );
  }

  @Get('documents')
  @ApiOperation({ summary: '获取 RAG 已索引文档列表' })
  documents() {
    return this.ragService.listDocuments();
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: '删除 RAG 已索引文档' })
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.ragService.deleteDocument(id);
  }
}
