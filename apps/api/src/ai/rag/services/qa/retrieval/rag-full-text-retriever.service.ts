import { Injectable } from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import {
  BaseRagRetriever,
  type RagRetrievalRow,
  type RagRetrieveInput,
} from './rag-retriever';

/** 使用 PostgreSQL 中文全文索引检索当前租户的候选切片。 */
@Injectable()
export class RagFullTextRetrieverService extends BaseRagRetriever {
  /** 从集中配置初始化全文检索候选上限和失败上下文。 */
  constructor(
    private readonly ragPrisma: RagPrismaService,
    logger: LoggerService,
  ) {
    const retrievalConfig = NodeConfigService.get('vcHelper').retrieval;
    super(
      logger,
      'keyword',
      retrievalConfig.keywordTopK,
      'RAG keyword retrieval failed',
      'rag_keyword_retrieval_failed',
    );
  }

  /** 空查询不执行全文检索。 */
  protected isDisabled(input: RagRetrieveInput): boolean {
    return !input.query.trim();
  }

  /** 分词后按全文相关度查询并映射租户隔离的候选切片。 */
  protected async retrieveCandidates(input: RagRetrieveInput, limit: number) {
    const normalizedQuery = input.query.trim();
    const rows = await this.ragPrisma.$queryRaw<RagRetrievalRow[]>`
      WITH keyword_terms AS (
        SELECT DISTINCT term.lexeme
        FROM ts_debug('zhparser', ${normalizedQuery}) debug
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
             d.file_name,
             d.file_type,
             d.source_path,
             ts_rank_cd(to_tsvector('zhparser', c.content), keyword_query.query) AS score
      FROM aplus_chunks c
      JOIN aplus_documents d ON d.id = c.document_id
      CROSS JOIN keyword_query
      WHERE c.tenant_code = ${input.tenantCode}
        AND d.tenant_code = ${input.tenantCode}
        AND keyword_query.query IS NOT NULL
        AND to_tsvector('zhparser', c.content) @@ keyword_query.query
      ORDER BY score DESC, c.id ASC
      LIMIT ${limit}
    `;

    return rows.map((row, index) => this.toCandidate(row, index + 1));
  }
}
