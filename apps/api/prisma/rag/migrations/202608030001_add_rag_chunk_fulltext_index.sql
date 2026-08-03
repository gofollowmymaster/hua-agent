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

CREATE INDEX IF NOT EXISTS idx_aplus_chunks_content_fts
  ON aplus_chunks USING gin (to_tsvector('zhparser', content));
