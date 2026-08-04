import type {
  RagQueryOptions,
  RagRetrievalRoute,
  RetrievalCandidate,
  RetrievedChunk,
  SourceItem,
} from './rag.type';

export type RagWorkflowMode = 'sync' | 'stream';

export type RagStageStatus = 'success' | 'disabled' | 'failed';

export interface RagRetrievalRouteResult {
  route: RagRetrievalRoute;
  status: RagStageStatus;
  candidates: RetrievalCandidate[];
  durationMs: number;
}

export interface RagRerankResult {
  status: RagStageStatus;
  chunks: RetrievedChunk[];
  durationMs: number;
}

export interface RagWorkflowInput {
  question: string;
  options: RagQueryOptions;
  mode: RagWorkflowMode;
}

export interface RagWorkflowResult {
  sessionKey: string;
  answer: string;
  sources: SourceItem[];
  chunks: RetrievedChunk[];
}
