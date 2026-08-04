BEGIN;

WITH ranked_documents AS (
  SELECT
    d.id,
    ROW_NUMBER() OVER (
      PARTITION BY d.tenant_code, d.file_hash
      ORDER BY
        CASE
          WHEN d.status = 'ready' AND EXISTS (
            SELECT 1
            FROM aplus_chunks c
            WHERE c.document_id = d.id
          ) THEN 0
          WHEN d.status = 'ready' THEN 1
          ELSE 2
        END,
        d.ingested_at DESC NULLS LAST,
        d.updated_at DESC,
        d.id DESC
    ) AS duplicate_rank
  FROM aplus_documents d
), duplicate_documents AS (
  SELECT id
  FROM ranked_documents
  WHERE duplicate_rank > 1
)
DELETE FROM aplus_documents d
USING duplicate_documents duplicate
WHERE d.id = duplicate.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'aplus_documents_tenant_code_file_hash_key'
      AND conrelid = 'aplus_documents'::regclass
  ) THEN
    ALTER TABLE aplus_documents
      ADD CONSTRAINT aplus_documents_tenant_code_file_hash_key
      UNIQUE (tenant_code, file_hash);
  END IF;
END $$;

COMMIT;
