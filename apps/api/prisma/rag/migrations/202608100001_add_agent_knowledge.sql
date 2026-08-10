CREATE EXTENSION IF NOT EXISTS vector;

CREATE EXTENSION IF NOT EXISTS zhparser;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'zhparser'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION zhparser (PARSER = zhparser);
    ALTER TEXT SEARCH CONFIGURATION zhparser
      ADD MAPPING FOR n,v,a,i,e,l,j WITH simple;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS agent_documents (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  category TEXT NOT NULL,
  source_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  remote_url TEXT,
  doc_id TEXT,
  wiki_node_id TEXT,
  last_modified_at TEXT,
  breadcrumb TEXT,
  source_type TEXT,
  current_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ingested_at TIMESTAMPTZ,
  UNIQUE (tenant_code, source_path),
  CONSTRAINT agent_documents_tenant_code_file_hash_key UNIQUE (tenant_code, file_hash)
);

CREATE TABLE IF NOT EXISTS agent_chunks (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  document_id BIGINT NOT NULL REFERENCES agent_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1024) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_agent_documents_tenant_code
  ON agent_documents (tenant_code);

CREATE INDEX IF NOT EXISTS idx_agent_documents_tenant_category
  ON agent_documents (tenant_code, category);

CREATE INDEX IF NOT EXISTS idx_agent_chunks_tenant_code
  ON agent_chunks (tenant_code);

CREATE INDEX IF NOT EXISTS idx_agent_chunks_document_id
  ON agent_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_agent_chunks_tenant_document
  ON agent_chunks (tenant_code, document_id);

CREATE INDEX IF NOT EXISTS idx_agent_chunks_embedding
  ON agent_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_agent_chunks_content_fts
  ON agent_chunks USING gin (to_tsvector('zhparser', content));
