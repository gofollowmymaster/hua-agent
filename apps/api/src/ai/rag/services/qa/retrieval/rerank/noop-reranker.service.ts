import { Injectable } from '@nestjs/common';
import type { RetrievalCandidate } from '../../../../types/rag.type';
import type { RagReranker, RagRerankInput } from './rag-reranker';

/** 保留融合顺序并仅按数量截断候选，用于关闭重排。 */
@Injectable()
export class NoopReranker implements RagReranker {
  /** 不调整候选分数或顺序，仅返回前 topK 项。 */
  async rerank(input: RagRerankInput): Promise<RetrievalCandidate[]> {
    return input.candidates.slice(0, input.topK);
  }
}
