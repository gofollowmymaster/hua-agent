export interface ParsedAgentKnowledgeDocument {
  metadata: Record<string, string>;
  content: string;
}

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
  originalContent: string;
  cleanedContent: string;
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

export interface AgentKnowledgeDocumentIdRow {
  id: bigint;
}

export interface AgentKnowledgeDocumentCountRow {
  count: bigint | number;
}
