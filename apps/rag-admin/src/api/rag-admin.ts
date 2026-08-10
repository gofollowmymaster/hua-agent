import { del, get, getBlob, http, post } from './http';

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GridPageResult<T> {
  records: T[];
  total: number;
}

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

export interface AgentKnowledgeDocumentItem {
  id: string | number;
  tenantCode: string;
  category: string;
  sourcePath: string;
  fileName: string;
  fileType: string;
  fileHash: string;
  fileSize: string | number;
  chunkCount: number;
  actualChunkCount: number;
  status: string;
  error?: string;
  metadata: Record<string, unknown>;
  remoteUrl?: string | null;
  docId?: string | null;
  wikiNodeId?: string | null;
  lastModifiedAt?: string | null;
  breadcrumb?: string | null;
  sourceType?: string | null;
  currentVersion?: string | null;
  createdAt: string;
  updatedAt: string;
  ingestedAt?: string | null;
}

export interface AgentKnowledgeSearchHit {
  id: string | number;
  documentId: string | number;
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

export interface AgentKnowledgeSearchParams {
  query: string;
  mode?: 'fulltext' | 'vector' | 'hybrid';
  category?: string;
  topK?: number;
}

export interface RagSessionItem {
  id: string | number;
  channel: string;
  sessionKey: string;
  userId?: string;
  conversationId?: string;
  conversationType?: string;
  messageCount: number;
  latestMessage?: {
    role: string;
    content: string;
    createdAt: string;
  };
  lastActiveAt: string;
  createdAt: string;
}

export interface RagMessageItem {
  id: string | number;
  role: string;
  content: string;
  senderId?: string;
  externalMessageId?: string;
  replyToMessageId?: string;
  createdAt: string;
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

export function pageAgentKnowledgeDocuments(
  params: Record<string, unknown>,
) {
  return get<PageResult<AgentKnowledgeDocumentItem>>(
    '/agent/knowledge/documents',
    { params: normalizeGridPageParams(params) },
  );
}

export async function pageAgentKnowledgeDocumentsGrid(
  params: Record<string, unknown>,
) {
  const result = await pageAgentKnowledgeDocuments(params);
  return {
    records: result.list,
    total: result.total,
  } satisfies GridPageResult<AgentKnowledgeDocumentItem>;
}

export function ingestAgentKnowledge(force: boolean) {
  return post('/agent/knowledge/ingest', { force });
}

export function deleteAgentKnowledgeDocument(id: string | number) {
  return del(`/agent/knowledge/documents/${id}`);
}

export function searchAgentKnowledge(params: AgentKnowledgeSearchParams) {
  return post<AgentKnowledgeSearchHit[]>('/agent/knowledge/search', params);
}

export function pageSessions(params: Record<string, unknown>) {
  return post<PageResult<RagSessionItem>>(
    '/ai/rag/admin/sessions/page',
    params,
  );
}

export async function pageSessionsGrid(params: Record<string, unknown>) {
  const result = await pageSessions(normalizeGridPageParams(params));

  return {
    records: result.list,
    total: result.total,
  } satisfies GridPageResult<RagSessionItem>;
}

export function listSessionMessages(id: string | number) {
  return get<RagMessageItem[]>(`/ai/rag/admin/sessions/${id}/messages`);
}

function normalizeGridPageParams(params: Record<string, unknown>) {
  return Object.entries(params).reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      if (value === undefined || value === null || value === '') return result;
      if (isEmptyObject(value)) return result;

      result[key === 'current' ? 'page' : key] = value;
      return result;
    },
    {},
  );
}

function isEmptyObject(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}
