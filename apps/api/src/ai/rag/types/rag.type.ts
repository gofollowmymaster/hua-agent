import type { UIMessage } from 'ai';
import type { RagRerankMode } from '@src/config/interface';

export interface LoadedSegment {
  text: string;
  metadata: Record<string, unknown>;
}

export interface RawDocumentFile {
  absolutePath: string;
  sourcePath: string;
  fileName: string;
  fileType: string;
  documentType: string;
  fileSize: number;
  fileHash: string;
}

export interface LoadedDocument extends RawDocumentFile {
  segments: LoadedSegment[];
}

export interface RetrievedChunk {
  id: string;
  tenantCode: string;
  documentId: string;
  fileName: string;
  fileType: string;
  sourcePath: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  score?: number;
  retrieval?: RetrievedChunkTrace;
}

export type RagRetrievalRoute = 'vector' | 'keyword';

export interface RetrievedChunkTrace {
  routes: RagRetrievalRoute[];
  ranks: Partial<Record<RagRetrievalRoute, number>>;
  scores: Partial<Record<RagRetrievalRoute, number>>;
  fusedScore?: number;
  rerankScore?: number;
  rerankMode?: RagRerankMode;
}

export interface RetrievalCandidate extends RetrievedChunk {
  retrieval: RetrievedChunkTrace;
  score: number;
}

export interface IngestSummary {
  scannedFiles: number;
  indexedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  chunks: number;
  files: Array<{
    sourcePath: string;
    status: 'indexed' | 'skipped' | 'failed';
    chunks?: number;
    reason?: string;
  }>;
}

export type RagChannel = 'http' | 'wecom' | 'feishu' | 'web' | string;

export type RagMemoryRole = 'user' | 'assistant';

export interface RagSessionInput {
  channel: RagChannel;
  conversationId?: string;
  conversationType?: string;
  participantId?: string;
  messageId?: string;
  replyToMessageId?: string;
  metadata?: Record<string, unknown>;
}

export interface RagResolvedSession extends RagSessionInput {
  tenantCode: string;
  sessionKey: string;
  encodedSessionKey: string;
}

export interface RagMemoryMessage {
  role: RagMemoryRole;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface RagQueryOptions {
  topK?: number;
  rerankMode?: RagRerankMode;
  session?: RagSessionInput;
}

export type RagStreamEvent =
  | {
      type: 'status';
      data: {
        stage: string;
        message: string;
        sessionKey?: string;
        topK?: number;
        chunks?: number;
      };
    }
  | { type: 'answer'; data: string }
  | { type: 'done'; data: { stage: string; message: string } };

// ── RAG 问答相关类型 ──

/** AGUI 协议流式问答请求 */
export interface RagChatRequest {
  id?: string;
  messages?: UIMessage[];
  participantId?: string;
}

/** 从 UIMessage[] 提取的用户问题 */
export interface RagUserQuestion {
  id?: string;
  text: string;
}

/** 检索引用来源 */
export interface SourceItem {
  documentId: string;
  fileName: string;
  fileType: string;
  sourcePath: string;
  location: string;
  bestSimilarity: number;
}
