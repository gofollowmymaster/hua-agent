import { del, get, post } from './http';

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
  fileSize: string | number;
  chunkCount: number;
  actualChunkCount: number;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  ingestedAt?: string;
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
  return post<PageResult<RagDocumentItem>>('/ai/rag/admin/documents/page', params);
}

export async function pageDocumentsGrid(params: Record<string, unknown>) {
  const result = await pageDocuments(normalizeGridPageParams(params));

  return {
    records: result.list,
    total: result.total,
  } satisfies GridPageResult<RagDocumentItem>;
}

export function deleteDocument(id: string | number) {
  return del(`/ai/rag/admin/documents/${id}`);
}

export function ingestDocuments(force: boolean) {
  return post('/ai/rag/admin/ingest', { force });
}

export function pageSessions(params: Record<string, unknown>) {
  return post<PageResult<RagSessionItem>>('/ai/rag/admin/sessions/page', params);
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
  return Object.entries(params).reduce<Record<string, unknown>>((result, [key, value]) => {
    if (value === undefined || value === null || value === '') return result;
    if (isEmptyObject(value)) return result;

    result[key === 'current' ? 'page' : key] = value;
    return result;
  }, {});
}

function isEmptyObject(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}
