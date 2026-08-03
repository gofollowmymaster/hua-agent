import type { RagQueryRewriteResult } from './rag-query-rewrite.service';
import type {
  RagMemoryMessage,
  RagQueryOptions,
  RagResolvedSession,
  RagRetrievalRoute,
  RagStreamEvent,
  RetrievalCandidate,
  RetrievedChunk,
  SourceItem,
} from '../../types/rag.type';

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
  options?: RagQueryOptions;
  mode: RagWorkflowMode;
}

export interface RagWorkflowState extends RagWorkflowInput {
  session?: RagResolvedSession;
  memory: RagMemoryMessage[];
  rewrite?: RagQueryRewriteResult;
  vectorResult?: RagRetrievalRouteResult;
  keywordResult?: RagRetrievalRouteResult;
  fusedCandidates: RetrievalCandidate[];
  rerankResult?: RagRerankResult;
  chunks: RetrievedChunk[];
  prompt?: string;
  answer: string;
  sources: SourceItem[];
}

export interface RagWorkflowResult {
  sessionKey: string;
  answer: string;
  sources: SourceItem[];
  chunks: RetrievedChunk[];
}

export type RagWorkflowStreamEvent = RagStreamEvent;
