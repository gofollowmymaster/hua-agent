import { del, get, getBlob, http, post } from '../common/http';
import { normalizePageParams, type PageResult } from '../common/types';

export interface DigitalAvatarDocumentItem {
  id: string | number;
  sourcePath: string;
  fileName: string;
  fileType: string;
  fileHash: string;
  fileSize: string | number;
  summary: string;
  chunkCount: number;
  actualChunkCount: number;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  ingestedAt?: string;
}

export interface DigitalAvatarChunkItem {
  id: string | number;
  documentId: string | number;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DigitalAvatarUploadFileResult {
  fileName: string;
  status: 'indexed' | 'duplicate' | 'failed';
  documentId?: string;
  sourcePath?: string;
  chunks?: number;
  duplicateOf?: { documentId: string; fileName: string };
  reason?: string;
}

export interface DigitalAvatarUploadResult {
  totalFiles: number;
  indexedFiles: number;
  duplicateFiles: number;
  failedFiles: number;
  chunks: number;
  files: DigitalAvatarUploadFileResult[];
}

const base = '/digital-avatar/admin';

export function pageDigitalAvatarDocuments(params: Record<string, unknown>) {
  return post<PageResult<DigitalAvatarDocumentItem>>(
    `${base}/documents/page`,
    normalizePageParams(params),
  );
}

export function getDigitalAvatarDocument(id: string | number) {
  return get<DigitalAvatarDocumentItem>(`${base}/documents/${id}`);
}

export function uploadDigitalAvatarDocuments(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file, file.name));
  return http.post<unknown, DigitalAvatarUploadResult>(
    `${base}/documents/upload`,
    formData,
    { timeout: 10 * 60 * 1000 },
  );
}

export function updateDigitalAvatarSummary(
  id: string | number,
  summary: string,
) {
  return post<DigitalAvatarDocumentItem>(`${base}/documents/${id}/summary`, {
    summary,
  });
}

export function pageDigitalAvatarChunks(
  id: string | number,
  params: Record<string, unknown>,
) {
  return post<PageResult<DigitalAvatarChunkItem>>(
    `${base}/documents/${id}/chunks/page`,
    normalizePageParams(params),
  );
}

export function getDigitalAvatarPreviewFile(id: string | number) {
  return getBlob(`${base}/documents/${id}/preview`);
}

export function reingestDigitalAvatarDocument(id: string | number) {
  return post<DigitalAvatarDocumentItem>(
    `${base}/documents/${id}/reingest`,
    {},
  );
}

export function deleteDigitalAvatarDocument(id: string | number) {
  return del(`${base}/documents/${id}`);
}
