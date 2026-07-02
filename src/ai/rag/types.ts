export interface LoadedSegment {
  text: string;
  metadata: Record<string, unknown>;
}

export interface RawDocumentFile {
  absolutePath: string;
  sourcePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
}

export interface LoadedDocument extends RawDocumentFile {
  segments: LoadedSegment[];
}

export interface RetrievedChunk {
  id: string;
  documentId: string;
  fileName: string;
  sourcePath: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
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
