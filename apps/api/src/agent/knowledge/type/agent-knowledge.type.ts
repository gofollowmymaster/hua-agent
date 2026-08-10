export type AgentKnowledgeSearchMode = 'fulltext' | 'vector' | 'hybrid';

export interface AgentKnowledgeDocumentFile {
  absolutePath: string;
  tenantCode: string;
  category: string;
  sourcePath: string;
  fileName: string;
  fileType: string;
  fileHash: string;
  fileSize: number;
  metadata: Record<string, string>;
  content: string;
}

export interface AgentKnowledgeIngestSummary {
  scannedFiles: number;
  indexedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  chunks: number;
  files: Array<{
    sourcePath: string;
    status: 'indexed' | 'skipped' | 'failed';
    documentId?: string;
    chunks?: number;
    reason?: string;
  }>;
}

export interface AgentKnowledgeSearchOptions {
  tenantCode: string;
  mode: AgentKnowledgeSearchMode;
  category?: string;
  topK: number;
}

export interface AgentKnowledgeSearchHit {
  id: string;
  documentId: string;
  tenantCode: string;
  category: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  fileName: string;
  sourcePath: string;
  remoteUrl?: string | null;
  docId?: string | null;
  wikiNodeId?: string | null;
  lastModifiedAt?: string | null;
  breadcrumb?: string | null;
  sourceType?: string | null;
  currentVersion?: string | null;
}
