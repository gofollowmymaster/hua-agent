CREATE EXTENSION IF NOT EXISTS vector;

-- 启用 zhparser 中文分词扩展
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

CREATE TABLE IF NOT EXISTS aplus_documents (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  source_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ingested_at TIMESTAMPTZ,
  UNIQUE (tenant_code, source_path),
  CONSTRAINT aplus_documents_tenant_code_file_hash_key UNIQUE (tenant_code, file_hash)
);

CREATE TABLE IF NOT EXISTS aplus_chunks (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  document_id BIGINT NOT NULL REFERENCES aplus_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1024) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_aplus_documents_tenant_code
  ON aplus_documents (tenant_code);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_tenant_code
  ON aplus_chunks (tenant_code);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_document_id
  ON aplus_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_tenant_document
  ON aplus_chunks (tenant_code, document_id);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_embedding
  ON aplus_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_content_fts
  ON aplus_chunks USING gin (to_tsvector('zhparser', content));

CREATE TABLE IF NOT EXISTS aplus_rag_sessions (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  channel TEXT NOT NULL,
  session_key TEXT NOT NULL,
  user_id TEXT,
  conversation_id TEXT,
  conversation_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, channel, session_key)
);

CREATE TABLE IF NOT EXISTS aplus_rag_messages (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  session_id BIGINT NOT NULL REFERENCES aplus_rag_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sender_id TEXT,
  external_message_id TEXT,
  reply_to_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT aplus_rag_messages_role_check CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_sessions_tenant_channel
  ON aplus_rag_sessions (tenant_code, channel);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_sessions_last_active
  ON aplus_rag_sessions (last_active_at);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_messages_tenant_session_created
  ON aplus_rag_messages (tenant_code, session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_messages_external_message
  ON aplus_rag_messages (tenant_code, external_message_id);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id BIGSERIAL PRIMARY KEY,
  task_key TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  cron TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled',
  last_run_time TIMESTAMPTZ,
  last_run_result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status
  ON scheduled_tasks (status);

CREATE TABLE IF NOT EXISTS scheduled_task_logs (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
  execute_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result TEXT NOT NULL,
  message TEXT,
  cost_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_task_logs_task_execute
  ON scheduled_task_logs (task_id, execute_time);
