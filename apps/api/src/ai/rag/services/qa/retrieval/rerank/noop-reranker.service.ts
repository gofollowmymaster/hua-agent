import { Injectable } from '@nestjs/common';
import type { RetrievalCandidate } from '../../../../types/rag.type';
import type { RagReranker, RagRerankInput } from './rag-reranker';

@Injectable()
export class NoopReranker implements RagReranker {
  async rerank(input: RagRerankInput): Promise<RetrievalCandidate[]> {
    return input.candidates.slice(0, input.topK);
  }
}
