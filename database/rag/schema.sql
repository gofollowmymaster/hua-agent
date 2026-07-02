CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS aplus_documents (
  id BIGSERIAL PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ingested_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aplus_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES aplus_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1024) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_document_id
  ON aplus_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_embedding
  ON aplus_chunks USING hnsw (embedding vector_cosine_ops);
