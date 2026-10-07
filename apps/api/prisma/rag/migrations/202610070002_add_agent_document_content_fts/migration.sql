CREATE INDEX IF NOT EXISTS idx_agent_documents_content_fts
  ON agent_documents USING gin (to_tsvector('zhparser', content));
