import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import pg from 'pg';
import { getRagConfig } from '../rag.config';

const { Pool } = pg;

@Injectable()
export class RagDatabaseService implements OnApplicationShutdown {
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: getRagConfig().databaseUrl,
    });
  }

  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[],
  ) {
    return this.pool.query<T>(text, params);
  }

  async transaction<T>(handler: (client: pg.PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await handler(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
