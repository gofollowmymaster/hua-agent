import { del, get, getBlob, http, post } from '../common/http';
import { normalizeGridPageParams } from '../common/types';
import type { GridPageResult, PageResult } from '../common/types';

export interface RagDocumentItem {
  id: string | number;
  sourcePath: string;
  fileName: string;
  fileType: string;
  type: string;
  tag: string;
  fileSize: string | number;
  chunkCount: number;
  actualChunkCount: number;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  ingestedAt?: string;
}

export interface RagDocumentChunkItem {
  id: string | number;
  documentId: string | number;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RagDocumentUploadFileResult {
  fileName: string;
  status: 'indexed' | 'duplicate' | 'failed';
  documentId?: string;
  sourcePath?: string;
  chunks?: number;
  duplicateOf?: {
    documentId: string;
    fileName: string;
  };
  reason?: string;
}

export interface RagDocumentUploadResult {
  totalFiles: number;
  indexedFiles: number;
  duplicateFiles: number;
  failedFiles: number;
  chunks: number;
  files: RagDocumentUploadFileResult[];
}

export function pageDocuments(params: Record<string, unknown>) {
  return post<PageResult<RagDocumentItem>>(
    '/ai/rag/admin/documents/page',
    params,
  );
}

export async function pageDocumentsGrid(params: Record<string, unknown>) {
  const result = await pageDocuments(normalizeGridPageParams(params));
  return {
    records: result.list,
    total: result.total,
  } satisfies GridPageResult<RagDocumentItem>;
}

export function getDocument(id: string | number) {
  return get<RagDocumentItem>(`/ai/rag/admin/documents/${id}`);
}

export function deleteDocument(id: string | number) {
  return del(`/ai/rag/admin/documents/${id}`);
}

export function uploadDocuments(files: File[]) {
  const formData = new FormData();
  for (const file of files) formData.append('files', file, file.name);

  return http.post<unknown, RagDocumentUploadResult>(
    '/ai/rag/admin/documents/upload',
    formData,
    { timeout: 10 * 60 * 1000 },
  );
}

export function updateDocumentMetadata(
  id: string | number,
  params: { type: string; tag: string },
) {
  return post(`/ai/rag/admin/documents/${id}/metadata`, params);
}

export function getDocumentPreviewFile(id: string | number) {
  return getBlob(`/ai/rag/admin/documents/${id}/preview`);
}

export function pageDocumentChunks(
  id: string | number,
  params: Record<string, unknown>,
) {
  return post<PageResult<RagDocumentChunkItem>>(
    `/ai/rag/admin/documents/${id}/chunks/page`,
    params,
  );
}

export function ingestDocuments(force: boolean) {
  return post('/ai/rag/admin/ingest', { force });
}
