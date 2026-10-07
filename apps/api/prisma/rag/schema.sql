CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_admin_users (
  id SERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  supplier_code TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_system_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, username)
);

CREATE INDEX IF NOT EXISTS idx_rag_admin_users_tenant_code
  ON rag_admin_users (tenant_code);

CREATE TABLE IF NOT EXISTS agent_user_skills (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES rag_admin_users(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  instruction TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT agent_user_skills_tenant_user_name_key
    UNIQUE (tenant_code, user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_agent_user_skills_tenant_user
  ON agent_user_skills (tenant_code, user_id);

CREATE INDEX IF NOT EXISTS idx_agent_user_skills_tenant_user_enabled
  ON agent_user_skills (tenant_code, user_id, is_enabled);

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

CREATE TABLE IF NOT EXISTS digital_avatar_documents (
  id BIGSERIAL PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_hash TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ingested_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS digital_avatar_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES digital_avatar_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1024) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_digital_avatar_documents_updated_at
  ON digital_avatar_documents (updated_at);

CREATE INDEX IF NOT EXISTS idx_digital_avatar_chunks_document_id
  ON digital_avatar_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_digital_avatar_chunks_embedding
  ON digital_avatar_chunks USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_digital_avatar_chunks_content_fts
  ON digital_avatar_chunks USING gin (to_tsvector('zhparser', content));

CREATE TABLE IF NOT EXISTS agent_documents (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  category TEXT NOT NULL,
  source_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
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

ALTER TABLE agent_documents
  ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

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

CREATE INDEX IF NOT EXISTS idx_agent_documents_content_fts
  ON agent_documents USING gin (to_tsvector('zhparser', content));

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

CREATE TABLE IF NOT EXISTS agent_chat_sessions (
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

CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  session_id BIGINT NOT NULL REFERENCES agent_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB NOT NULL DEFAULT '{}'::jsonb,
  parts JSONB,
  sender_id TEXT,
  external_message_id TEXT,
  reply_to_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_tenant_channel
  ON agent_chat_sessions (tenant_code, channel);

CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_last_active
  ON agent_chat_sessions (last_active_at);

CREATE INDEX IF NOT EXISTS idx_agent_chat_messages_tenant_session_created
  ON agent_chat_messages (tenant_code, session_id, created_at);

ALTER TABLE agent_chat_messages
  ADD COLUMN IF NOT EXISTS parts JSONB;

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
