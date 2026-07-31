import { Injectable } from '@nestjs/common';
import { RagQueryService } from './services/qa/rag-query.service';
import { RagStreamService } from './services/qa/rag-stream.service';
import type { RagQueryOptions, RagStreamEvent } from './types/rag.type';

// 重导出保持向后兼容
export type { RagChatRequest } from './types/rag.type';

/**
 * RAG 问答 Facade
 *
 * 保持与原有 RagService 完全相同的公共接口，
 * 内部委托给 RagQueryService（同步问答）和 RagStreamService（流式问答）。
 * 所有外部调用方（RagController、WecomRagBotService）无需修改。
 */
@Injectable()
export class RagService {
  constructor(
    private readonly queryService: RagQueryService,
    private readonly streamService: RagStreamService,
  ) {}

  async answerQuestion(question: string, options: RagQueryOptions = {}) {
    return this.queryService.answerQuestion(question, options);
  }

  streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagStreamEvent> {
    return this.streamService.streamAnswer(question, options);
  }

  createChatStream(params: {
    id?: string;
    messages?: any[];
    participantId?: string;
  }) {
    return this.streamService.createChatStream(params);
  }
}
