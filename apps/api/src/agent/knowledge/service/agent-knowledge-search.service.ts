import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import type {
  AgentKnowledgeRetrievalRow,
  AgentKnowledgeSearchHit,
  AgentKnowledgeSearchOptions,
} from '../type/agent-knowledge-search.type';

/** 提供业务 Agent 知识库的全文、向量和混合检索。 */
@Injectable()
export class AgentKnowledgeSearchService {
  private readonly embeddings: OpenAIEmbeddings;

  /** 从集中配置初始化向量检索使用的 Embeddings 客户端。 */
  constructor(private readonly ragPrisma: RagPrismaService) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });
  }

  /** 按检索模式执行查询并返回命中片段。 */
  async search(
    query: string,
    options: AgentKnowledgeSearchOptions,
  ): Promise<AgentKnowledgeSearchHit[]> {
    const topK = this.normalizeTopK(options.topK);
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [];
    console.log('[ query options ] >', query, options);
    if (options.mode === 'fulltext') {
      return this.searchFullText(normalizedQuery, options, topK);
    }
    if (options.mode === 'vector') {
      return this.searchVector(normalizedQuery, options, topK);
    }

    const candidateLimit = Math.min(topK * 2, 100);
    const [fullTextHits, vectorHits] = await Promise.all([
      this.searchFullText(normalizedQuery, options, candidateLimit),
      this.searchVector(normalizedQuery, options, candidateLimit),
    ]);
    return this.mergeByRrf([fullTextHits, vectorHits], topK);
  }

  /** 使用 zhparser 中文全文索引检索当前租户片段。 */
  private async searchFullText(
    query: string,
    options: AgentKnowledgeSearchOptions,
    limit: number,
  ): Promise<AgentKnowledgeSearchHit[]> {
    const rows = await this.ragPrisma.$queryRaw<AgentKnowledgeRetrievalRow[]>`
      WITH keyword_terms AS (
        SELECT DISTINCT term.lexeme
        FROM ts_debug('zhparser', ${query}) debug
        CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme)
        WHERE term.lexeme <> ''
      ),
      keyword_query AS (
        SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query
        FROM keyword_terms
      )
      SELECT c.id,
             c.tenant_code,
             c.document_id,
             c.chunk_index,
             c.content,
             c.metadata,
             d.category,
             d.file_name,
             d.source_path,
             d.remote_url,
             d.doc_id,
             d.wiki_node_id,
             d.last_modified_at,
             d.breadcrumb,
             d.source_type,
             d.current_version,
             ts_rank_cd(to_tsvector('zhparser', c.content), keyword_query.query) AS score
      FROM agent_chunks c
      JOIN agent_documents d ON d.id = c.document_id
      CROSS JOIN keyword_query
      WHERE c.tenant_code = ${options.tenantCode}
        AND d.tenant_code = ${options.tenantCode}
        AND (${options.category ?? null}::text IS NULL OR d.category = ${options.category ?? null})
        AND keyword_query.query IS NOT NULL
        AND to_tsvector('zhparser', c.content) @@ keyword_query.query
      ORDER BY score DESC, c.id ASC
      LIMIT ${limit}
    `;
    return rows.map((row) => this.toHit(row));
  }

  /** 使用 pgvector 余弦相似度检索当前租户片段。 */
  private async searchVector(
    query: string,
    options: AgentKnowledgeSearchOptions,
    limit: number,
  ): Promise<AgentKnowledgeSearchHit[]> {
    const vector = await this.embeddings.embedQuery(query);
    const rows = await this.ragPrisma.$queryRaw<AgentKnowledgeRetrievalRow[]>`
      SELECT c.id,
             c.tenant_code,
             c.document_id,
             c.chunk_index,
             c.content,
             c.metadata,
             d.category,
             d.file_name,
             d.source_path,
             d.remote_url,
             d.doc_id,
             d.wiki_node_id,
             d.last_modified_at,
             d.breadcrumb,
             d.source_type,
             d.current_version,
             1 - (c.embedding <=> ${JSON.stringify(vector)}::vector) AS score
      FROM agent_chunks c
      JOIN agent_documents d ON d.id = c.document_id
      WHERE c.tenant_code = ${options.tenantCode}
        AND d.tenant_code = ${options.tenantCode}
        AND (${options.category ?? null}::text IS NULL OR d.category = ${options.category ?? null})
      ORDER BY c.embedding <=> ${JSON.stringify(vector)}::vector
      LIMIT ${limit}
    `;

    return rows.map((row) => this.toHit(row));
  }

  /** 使用 Reciprocal Rank Fusion 合并多路候选结果。 */
  private mergeByRrf(
    routes: AgentKnowledgeSearchHit[][],
    topK: number,
  ): AgentKnowledgeSearchHit[] {
    const merged = new Map<
      string,
      { hit: AgentKnowledgeSearchHit; score: number }
    >();

    for (const candidates of routes) {
      for (let rank = 0; rank < candidates.length; rank += 1) {
        const hit = candidates[rank];
        const current = merged.get(hit.id) ?? { hit, score: 0 };
        current.score += 1 / (60 + rank + 1);
        merged.set(hit.id, current);
      }
    }

    return [...merged.values()]
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
      .map((item) => ({ ...item.hit, score: item.score }));
  }

  /** 将数据库检索行转换为统一命中结果。 */
  private toHit(row: AgentKnowledgeRetrievalRow): AgentKnowledgeSearchHit {
    return {
      id: String(row.id),
      documentId: String(row.document_id),
      tenantCode: row.tenant_code,
      category: row.category,
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      metadata: row.metadata ?? {},
      score: Number(row.score) || 0,
      fileName: row.file_name,
      sourcePath: row.source_path,
      remoteUrl: row.remote_url ?? null,
      docId: row.doc_id ?? null,
      wikiNodeId: row.wiki_node_id ?? null,
      lastModifiedAt: row.last_modified_at ?? null,
      breadcrumb: row.breadcrumb ?? null,
      sourceType: row.source_type ?? null,
      currentVersion: row.current_version ?? null,
    };
  }

  /** 将 topK 规范到 1 到 100 的安全范围。 */
  private normalizeTopK(value: number) {
    return Math.min(Math.max(Number(value) || 8, 1), 100);
  }
}
