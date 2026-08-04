import type { RetrievalCandidate } from '../../../../types/rag.type';

export type RagRerankInput = {
  query: string;
  originalQuestion: string;
  candidates: RetrievalCandidate[];
  topK: number;
  tenantCode: string;
  sessionKey?: string;
};

export interface RagReranker {
  rerank(input: RagRerankInput): Promise<RetrievalCandidate[]>;
}
