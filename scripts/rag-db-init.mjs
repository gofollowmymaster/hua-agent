import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../database/rag/schema.sql');
const connectionString =
  process.env.RAG_DATABASE_URL ?? 'postgres://user:123456@localhost:5432/hello_pg';

const pool = new Pool({ connectionString });

try {
  const schema = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('RAG database schema initialized.');
} finally {
  await pool.end();
}
