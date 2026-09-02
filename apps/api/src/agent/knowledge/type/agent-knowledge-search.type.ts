export type AgentKnowledgeSearchMode = 'fulltext' | 'vector' | 'hybrid';

export enum AgentKnowledgeSearchModeEnum {
  fulltext = 'fulltext',
  vector = 'vector',
  hybrid = 'hybrid',
}

export interface AgentKnowledgeSearchOptions {
  tenantCode: string;
  mode: AgentKnowledgeSearchMode;
  category?: string;
  topK?: number;
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
  remoteUrl: string | null;
  docId: string | null;
  wikiNodeId: string | null;
  lastModifiedAt: string | null;
  breadcrumb: string | null;
  sourceType: string | null;
  currentVersion: string | null;
}

export interface AgentKnowledgeRetrievalRow {
  id: bigint | number | string;
  tenant_code: string;
  document_id: bigint | number | string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
  category: string;
  file_name: string;
  source_path: string;
  remote_url?: string | null;
  doc_id?: string | null;
  wiki_node_id?: string | null;
  last_modified_at?: string | null;
  breadcrumb?: string | null;
  source_type?: string | null;
  current_version?: string | null;
  score: number | string;
}
