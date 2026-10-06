import { del, get, getBlob, post } from '../common/http';
import { normalizePageParams, type PageResult } from '../common/types';

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

export interface AgentKnowledgeChunkItem {
  id: string | number;
  documentId: string | number;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function pageAgentKnowledgeDocuments(params: Record<string, unknown>) {
  return get<PageResult<AgentKnowledgeDocumentItem>>(
    '/agent/knowledge/documents',
    { params: normalizePageParams(params) },
  );
}
export function getAgentKnowledgeDocument(id: string | number) {
  return get<AgentKnowledgeDocumentItem>(`/agent/knowledge/documents/${id}`);
}
export function pageAgentKnowledgeDocumentChunks(
  id: string | number,
  params: Record<string, unknown>,
) {
  return post<PageResult<AgentKnowledgeChunkItem>>(
    `/agent/knowledge/documents/${id}/chunks/page`,
    normalizePageParams(params),
  );
}
export function getAgentKnowledgeDocumentPreviewFile(id: string | number) {
  return getBlob(`/agent/knowledge/documents/${id}/preview`);
}
export function ingestAgentKnowledge(force: boolean) {
  return post('/agent/knowledge/ingest', { force });
}
export function deleteAgentKnowledgeDocument(id: string | number) {
  return del(`/agent/knowledge/documents/${id}`);
}
