ALTER TABLE aplus_documents
  ADD COLUMN IF NOT EXISTS tenant_code TEXT;

UPDATE aplus_documents
SET tenant_code = 'aplus'
WHERE tenant_code IS NULL OR tenant_code = '';

ALTER TABLE aplus_documents
  ALTER COLUMN tenant_code SET NOT NULL;

ALTER TABLE aplus_chunks
  ADD COLUMN IF NOT EXISTS tenant_code TEXT;

UPDATE aplus_chunks c
SET tenant_code = d.tenant_code
FROM aplus_documents d
WHERE c.document_id = d.id
  AND (c.tenant_code IS NULL OR c.tenant_code = '');

ALTER TABLE aplus_chunks
  ALTER COLUMN tenant_code SET NOT NULL;

ALTER TABLE aplus_documents
  DROP CONSTRAINT IF EXISTS aplus_documents_source_path_key;

ALTER TABLE aplus_documents
  ADD CONSTRAINT aplus_documents_tenant_code_source_path_key
  UNIQUE (tenant_code, source_path);

ALTER TABLE aplus_chunks
  DROP CONSTRAINT IF EXISTS aplus_chunks_document_id_chunk_index_key;

ALTER TABLE aplus_chunks
  ADD CONSTRAINT aplus_chunks_tenant_code_document_id_chunk_index_key
  UNIQUE (tenant_code, document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_aplus_documents_tenant_code
  ON aplus_documents (tenant_code);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_tenant_code
  ON aplus_chunks (tenant_code);

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_tenant_document
  ON aplus_chunks (tenant_code, document_id);
