import type {
  RagQueryOptions,
  RagRetrievalRoute,
  RetrievalCandidate,
  RetrievedChunk,
  SourceItem,
} from './rag.type';
import type { RagRerankMode } from '@src/config/interface';

export type RagWorkflowMode = 'sync' | 'stream';

export type RagQuestionRoute = 'rag' | 'direct';

export type RagStageStatus = 'success' | 'disabled' | 'failed';

export interface RagRetrievalRouteResult {
  route: RagRetrievalRoute;
  status: RagStageStatus;
  candidates: RetrievalCandidate[];
  durationMs: number;
}

export interface RagRerankResult {
  status: RagStageStatus;
  mode: RagRerankMode;
  fallbackMode?: Exclude<RagRerankMode, 'model'>;
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

export interface RagAnswerGenerationResult {
  answer: string;
  reasoningFallback: boolean;
}

export interface RagQuestionRouteResult {
  route: RagQuestionRoute;
  status: 'success' | 'failed';
  durationMs: number;
  /** 仅供内部诊断，不得写入结构化日志或公开响应。 */
  routeReason?: string;
  fallbackReason?: string;
}
