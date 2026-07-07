ALTER TABLE aplus_documents
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT '';

ALTER TABLE aplus_documents
  ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT '';

UPDATE aplus_documents
SET "type" = CASE
  WHEN source_path LIKE 'raw/%/%/%' THEN split_part(source_path, '/', 3)
  WHEN source_path LIKE 'raw/%/%' THEN ''
  WHEN source_path LIKE '%/%' THEN split_part(source_path, '/', 1)
  ELSE ''
END
WHERE "type" = '';
