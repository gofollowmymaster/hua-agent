import fs from 'node:fs';
import path from 'node:path';

describe('RAG document file-hash migration', () => {
  const migration = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'prisma/rag/migrations/202608040001_add_document_file_hash_unique.sql',
    ),
    'utf8',
  );
  const schema = fs.readFileSync(
    path.resolve(process.cwd(), 'prisma/rag/schema.sql'),
    'utf8',
  );

  it('atomically keeps the preferred document and deletes lower-ranked duplicates', () => {
    expect(migration).toMatch(/^BEGIN;/);
    expect(migration).toContain('PARTITION BY d.tenant_code, d.file_hash');
    expect(migration).toContain("d.status = 'ready' AND EXISTS");
    expect(migration).toContain("WHEN d.status = 'ready' THEN 1");
    expect(migration).toContain('d.ingested_at DESC NULLS LAST');
    expect(migration).toContain('d.updated_at DESC');
    expect(migration).toContain('d.id DESC');
    expect(migration).toContain('WHERE duplicate_rank > 1');
    expect(migration.trim()).toMatch(/COMMIT;$/);
  });

  it('adds the same-tenant file-hash unique constraint', () => {
    expect(migration).toContain(
      'CONSTRAINT aplus_documents_tenant_code_file_hash_key',
    );
    expect(migration).toContain('UNIQUE (tenant_code, file_hash)');
  });

  it('cascades document deletion to associated chunks', () => {
    expect(schema).toMatch(
      /document_id BIGINT NOT NULL REFERENCES aplus_documents\(id\) ON DELETE CASCADE/,
    );
  });
});
