import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../prisma/rag/schema.sql');
const checkOnly = process.argv.includes('--check');
const connectionString =
  process.env.RAG_DATABASE_URL ??
  'postgres://user:123456@localhost:5432/hello_pg';
const requiredSkillIndexes = [
  'agent_user_skills_pkey',
  'agent_user_skills_tenant_user_name_key',
  'idx_agent_user_skills_tenant_user',
  'idx_agent_user_skills_tenant_user_enabled',
];
const requiredAgentKnowledgeIndexes = [
  'idx_agent_documents_content_fts',
  'idx_agent_chunks_content_fts',
];
const requiredDigitalAvatarIndexes = [
  'digital_avatar_documents_pkey',
  'digital_avatar_documents_source_path_key',
  'digital_avatar_documents_file_hash_key',
  'idx_digital_avatar_documents_updated_at',
  'digital_avatar_chunks_pkey',
  'digital_avatar_chunks_document_id_chunk_index_key',
  'idx_digital_avatar_chunks_document_id',
  'idx_digital_avatar_chunks_embedding',
  'idx_digital_avatar_chunks_content_fts',
];

const pool = new Pool({ connectionString });

try {
  if (!checkOnly) {
    const schema = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schema);
  }

  const tableResult = await pool.query(
    `SELECT to_regclass('public.agent_user_skills') IS NOT NULL AS exists`,
  );
  if (!tableResult.rows[0]?.exists) {
    throw new Error(
      'RAG database schema check failed: missing table agent_user_skills.',
    );
  }

  const documentContentResult = await pool.query(
    `SELECT EXISTS (
       SELECT 1
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'agent_documents'
          AND column_name = 'content'
          AND data_type = 'text'
          AND is_nullable = 'NO'
     ) AS exists`,
  );
  if (!documentContentResult.rows[0]?.exists) {
    throw new Error(
      'RAG database schema check failed: missing required agent_documents.content column.',
    );
  }

  const digitalAvatarTablesResult = await pool.query(
    `SELECT to_regclass('public.digital_avatar_documents') IS NOT NULL AS documents,
            to_regclass('public.digital_avatar_chunks') IS NOT NULL AS chunks`,
  );
  if (
    !digitalAvatarTablesResult.rows[0]?.documents ||
    !digitalAvatarTablesResult.rows[0]?.chunks
  ) {
    throw new Error(
      'RAG database schema check failed: missing digital avatar tables.',
    );
  }

  const indexResult = await pool.query(
    `SELECT indexname
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'agent_user_skills'`,
  );
  const actualIndexes = new Set(indexResult.rows.map((row) => row.indexname));
  const missingIndexes = requiredSkillIndexes.filter(
    (indexName) => !actualIndexes.has(indexName),
  );
  if (missingIndexes.length > 0) {
    throw new Error(
      `RAG database schema check failed: missing indexes ${missingIndexes.join(', ')}.`,
    );
  }

  const agentKnowledgeIndexResult = await pool.query(
    `SELECT indexname
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('agent_documents', 'agent_chunks')`,
  );
  const actualAgentKnowledgeIndexes = new Set(
    agentKnowledgeIndexResult.rows.map((row) => row.indexname),
  );
  const missingAgentKnowledgeIndexes = requiredAgentKnowledgeIndexes.filter(
    (indexName) => !actualAgentKnowledgeIndexes.has(indexName),
  );
  if (missingAgentKnowledgeIndexes.length > 0) {
    throw new Error(
      `RAG database schema check failed: missing indexes ${missingAgentKnowledgeIndexes.join(', ')}.`,
    );
  }


  const digitalAvatarIndexResult = await pool.query(
    `SELECT indexname
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('digital_avatar_documents', 'digital_avatar_chunks')`,
  );
  const actualDigitalAvatarIndexes = new Set(
    digitalAvatarIndexResult.rows.map((row) => row.indexname),
  );
  const missingDigitalAvatarIndexes = requiredDigitalAvatarIndexes.filter(
    (indexName) => !actualDigitalAvatarIndexes.has(indexName),
  );
  if (missingDigitalAvatarIndexes.length > 0) {
    throw new Error(
      `RAG database schema check failed: missing indexes ${missingDigitalAvatarIndexes.join(', ')}.`,
    );
  }

  console.log(
    checkOnly
      ? 'RAG database schema check passed.'
      : 'RAG database schema initialized and checked.',
  );
} finally {
  await pool.end();
}
