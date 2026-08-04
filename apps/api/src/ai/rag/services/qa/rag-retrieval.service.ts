import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '../prisma/rag-prisma.service';
import type {
  RagRetrievalRoute,
  RetrievalCandidate,
  RetrievedChunk,
} from '../../types/rag.type';
import type { RagRetrievalConfig } from '@src/config/interface';
import type {
  RagRerankResult,
  RagRetrievalRouteResult,
  RagStageStatus,
} from '../../types/rag-workflow.type';

type RagRetrievalRow = {
  id: bigint | number | string;
  tenant_code: string;
  document_id: bigint | number | string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
  file_name: string;
  file_type: string;
  source_path: string;
  score: number | string;
};

type RagRerankInput = {
  query: string;
  originalQuestion: string;
  candidates: RetrievalCandidate[];
  topK: number;
  tenantCode: string;
  sessionKey?: string;
};

export interface RagReranker {
  rerank(input: RagRerankInput): Promise<RetrievalCandidate[]>;
}

export class NoopReranker implements RagReranker {
  async rerank(input: RagRerankInput): Promise<RetrievalCandidate[]> {
    return input.candidates.slice(0, input.topK);
  }
}

export class RuleBasedReranker implements RagReranker {
  async rerank(input: RagRerankInput): Promise<RetrievalCandidate[]> {
    const terms = this.extractTerms(input.query, input.originalQuestion);
    const documentCounts = new Map<string, number>();

    return [...input.candidates]
      .map((candidate) => {
        const usedCount = documentCounts.get(candidate.documentId) ?? 0;
        documentCounts.set(candidate.documentId, usedCount + 1);

        const contentHitScore = this.countHits(candidate.content, terms) * 0.02;
        const titleHitScore = this.countHits(candidate.fileName, terms) * 0.04;
        const multiRouteScore =
          candidate.retrieval.routes.length > 1 ? 0.03 : 0;
        const diversityPenalty = Math.min(usedCount, 3) * 0.015;
        const rerankScore =
          candidate.score +
          contentHitScore +
          titleHitScore +
          multiRouteScore -
          diversityPenalty;

        return {
          ...candidate,
          score: rerankScore,
          retrieval: {
            ...candidate.retrieval,
            rerankScore,
            rerankMode: 'rule',
          },
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, input.topK);
  }

  private extractTerms(query: string, originalQuestion: string): string[] {
    const values = [query, originalQuestion]
      .flatMap((value) =>
        value
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, ' ')
          .split(/\s+/u),
      )
      .map((value) => value.trim())
      .filter((value) => value.length >= 2);

    return Array.from(new Set(values)).slice(0, 12);
  }

  private countHits(value: string, terms: string[]) {
    const normalized = value.toLowerCase();
    return terms.filter((term) => normalized.includes(term)).length;
  }
}

@Injectable()
export class RagRetrievalService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly defaultTopK: number;
  private readonly retrievalConfig: RagRetrievalConfig;
  private readonly noopReranker = new NoopReranker();
  private readonly ruleBasedReranker = new RuleBasedReranker();

  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
  ) {
    this.logger.setContext(RagRetrievalService.name);

    const ragConfig = NodeConfigService.get('vcHelper');
    this.defaultTopK = ragConfig.defaultTopK;
    this.retrievalConfig = ragConfig.retrieval ?? {
      vectorTopK: 32,
      keywordTopK: 32,
      fusionK: 60,
      rerankMode: 'rule',
      rerankTopN: 30,
    };

    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });
  }

  async retrieve(params: {
    query: string;
    originalQuestion?: string;
    topK?: number;
    sessionKey?: string;
  }): Promise<RetrievedChunk[]> {
    const tenantCode = this.tenantContext.tenant;
    const [vectorResult, keywordResult] = await Promise.all([
      this.retrieveVector({ query: params.query, tenantCode }),
      this.retrieveKeyword({ query: params.query, tenantCode }),
    ]);
    const fusedCandidates = this.fuseCandidates([
      vectorResult.candidates,
      keywordResult.candidates,
    ]);

    return (
      await this.rerankCandidates({
        query: params.query,
        originalQuestion: params.originalQuestion ?? params.query,
        candidates: fusedCandidates,
        topK: params.topK,
        tenantCode,
        sessionKey: params.sessionKey,
      })
    ).chunks;
  }

  async retrieveVector(params: {
    query: string;
    tenantCode: string;
  }): Promise<RagRetrievalRouteResult> {
    // 召回节点用显式状态区分“无命中、已禁用、执行失败”，避免都表现为空数组。
    const startedAt = Date.now();
    const limit = this.normalizeCandidateLimit(this.retrievalConfig.vectorTopK);
    if (limit <= 0) {
      return this.buildRouteResult('vector', 'disabled', [], startedAt);
    }

    try {
      const vector = await this.embeddings.embedQuery(params.query);
      const rows = await this.ragPrisma.$queryRaw<RagRetrievalRow[]>`
        SELECT c.id,
               c.tenant_code,
               c.document_id,
               c.chunk_index,
               c.content,
               c.metadata,
               d.file_name,
               d.file_type,
               d.source_path,
               1 - (c.embedding <=> ${JSON.stringify(vector)}::vector) AS score
        FROM aplus_chunks c
        JOIN aplus_documents d ON d.id = c.document_id
        WHERE c.embedding IS NOT NULL
          AND c.tenant_code = ${params.tenantCode}
          AND d.tenant_code = ${params.tenantCode}
        ORDER BY c.embedding <=> ${JSON.stringify(vector)}::vector
        LIMIT ${limit}
      `;

      return this.buildRouteResult(
        'vector',
        'success',
        rows.map((row, index) => this.toCandidate(row, 'vector', index + 1)),
        startedAt,
      );
    } catch (error) {
      this.logger.warn('RAG vector retrieval failed', undefined, {
        stage: 'rag_vector_retrieval_failed',
        tenantCode: params.tenantCode,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.buildRouteResult('vector', 'failed', [], startedAt);
    }
  }

  async retrieveKeyword(params: {
    query: string;
    tenantCode: string;
  }): Promise<RagRetrievalRouteResult> {
    const startedAt = Date.now();
    const limit = this.normalizeCandidateLimit(
      this.retrievalConfig.keywordTopK,
    );
    const normalizedQuery = params.query.trim();
    if (limit <= 0 || !normalizedQuery) {
      return this.buildRouteResult('keyword', 'disabled', [], startedAt);
    }

    try {
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
        WHERE c.tenant_code = ${params.tenantCode}
          AND d.tenant_code = ${params.tenantCode}
          AND keyword_query.query IS NOT NULL
          AND to_tsvector('zhparser', c.content) @@ keyword_query.query
        ORDER BY score DESC, c.id ASC
        LIMIT ${limit}
      `;

      return this.buildRouteResult(
        'keyword',
        'success',
        rows.map((row, index) => this.toCandidate(row, 'keyword', index + 1)),
        startedAt,
      );
    } catch (error) {
      this.logger.warn('RAG keyword retrieval failed', undefined, {
        stage: 'rag_keyword_retrieval_failed',
        tenantCode: params.tenantCode,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.buildRouteResult('keyword', 'failed', [], startedAt);
    }
  }

  fuseCandidates(
    candidateGroups: RetrievalCandidate[][],
  ): RetrievalCandidate[] {
    const candidateMap = new Map<string, RetrievalCandidate>();
    const fusionK = Math.max(this.retrievalConfig.fusionK, 1);

    for (const candidates of candidateGroups) {
      for (const candidate of candidates) {
        const current = candidateMap.get(candidate.id);
        const routeScore = this.routeWeight(candidate.retrieval.routes[0]);
        const routeRank =
          candidate.retrieval.vectorRank ??
          candidate.retrieval.keywordRank ??
          1;
        const rrfScore = routeScore / (fusionK + routeRank);

        if (!current) {
          candidateMap.set(candidate.id, {
            ...candidate,
            score: rrfScore,
            retrieval: {
              ...candidate.retrieval,
              fusedScore: rrfScore,
            },
          });
          continue;
        }

        const routes = Array.from(
          new Set([...current.retrieval.routes, ...candidate.retrieval.routes]),
        );
        const fusedScore =
          (current.retrieval.fusedScore ?? current.score) + rrfScore;
        candidateMap.set(candidate.id, {
          ...current,
          score: fusedScore,
          similarity:
            current.retrieval.vectorScore ??
            candidate.retrieval.vectorScore ??
            current.similarity,
          retrieval: {
            routes,
            vectorRank:
              current.retrieval.vectorRank ?? candidate.retrieval.vectorRank,
            keywordRank:
              current.retrieval.keywordRank ?? candidate.retrieval.keywordRank,
            vectorScore:
              current.retrieval.vectorScore ?? candidate.retrieval.vectorScore,
            keywordScore:
              current.retrieval.keywordScore ??
              candidate.retrieval.keywordScore,
            fusedScore,
          },
        });
      }
    }

    return Array.from(candidateMap.values()).sort(
      (left, right) => right.score - left.score,
    );
  }

  async rerankCandidates(params: {
    query: string;
    originalQuestion: string;
    candidates: RetrievalCandidate[];
    topK?: number;
    tenantCode: string;
    sessionKey?: string;
  }): Promise<RagRerankResult> {
    // rerank 失败仍返回融合排序结果，保证单个后处理节点不会阻断问答。
    const startedAt = Date.now();
    const limit = this.normalizeLimit(params.topK);
    const rerankTopN = Math.min(
      Math.max(this.retrievalConfig.rerankTopN, limit),
      100,
    );
    const rerankCandidates = params.candidates.slice(0, rerankTopN);
    const reranker = this.resolveReranker();

    try {
      const chunks = (
        await reranker.rerank({
          query: params.query,
          originalQuestion: params.originalQuestion,
          candidates: rerankCandidates,
          topK: limit,
          tenantCode: params.tenantCode,
          sessionKey: params.sessionKey,
        })
      ).map((candidate) => this.toRetrievedChunk(candidate));

      return {
        status:
          this.retrievalConfig.rerankMode === 'none' ? 'disabled' : 'success',
        chunks,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      this.logger.warn(
        'RAG rerank failed, fallback to fused candidates',
        undefined,
        {
          stage: 'rag_rerank_failed_fallback',
          tenantCode: params.tenantCode,
          sessionKey: params.sessionKey,
          rerankMode: this.retrievalConfig.rerankMode,
          error: error instanceof Error ? error.message : String(error),
        },
      );

      return {
        status: 'failed',
        chunks: params.candidates
          .slice(0, limit)
          .map((candidate) => this.toRetrievedChunk(candidate)),
        durationMs: Date.now() - startedAt,
      };
    }
  }

  private resolveReranker(): RagReranker {
    if (this.retrievalConfig.rerankMode === 'none') {
      return this.noopReranker;
    }

    if (this.retrievalConfig.rerankMode === 'model') {
      this.logger.warn(
        'RAG model reranker is not implemented, fallback to rule',
        undefined,
        {
          stage: 'rag_model_rerank_not_implemented',
          tenantCode: this.tenantContext.tenant,
        },
      );
    }

    return this.ruleBasedReranker;
  }

  private routeWeight(route: RagRetrievalRoute) {
    if (route === 'keyword') return 0.8;
    return 1;
  }

  private buildRouteResult(
    route: RagRetrievalRoute,
    status: RagStageStatus,
    candidates: RetrievalCandidate[],
    startedAt: number,
  ): RagRetrievalRouteResult {
    return {
      route,
      status,
      candidates,
      durationMs: Date.now() - startedAt,
    };
  }

  private toCandidate(
    row: RagRetrievalRow,
    route: RagRetrievalRoute,
    rank: number,
  ): RetrievalCandidate {
    const score = Number(row.score) || 0;

    return {
      id: String(row.id),
      tenantCode: row.tenant_code,
      documentId: String(row.document_id),
      fileName: row.file_name,
      fileType: row.file_type,
      sourcePath: row.source_path,
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: route === 'vector' ? score : 0,
      score,
      retrieval: {
        routes: [route],
        vectorRank: route === 'vector' ? rank : undefined,
        keywordRank: route === 'keyword' ? rank : undefined,
        vectorScore: route === 'vector' ? score : undefined,
        keywordScore: route === 'keyword' ? score : undefined,
      },
    };
  }

  private toRetrievedChunk(candidate: RetrievalCandidate): RetrievedChunk {
    return {
      id: candidate.id,
      tenantCode: candidate.tenantCode,
      documentId: candidate.documentId,
      fileName: candidate.fileName,
      fileType: candidate.fileType,
      sourcePath: candidate.sourcePath,
      chunkIndex: candidate.chunkIndex,
      content: candidate.content,
      metadata: candidate.metadata,
      similarity: candidate.retrieval.vectorScore ?? candidate.similarity,
      score: candidate.score,
      retrieval: candidate.retrieval,
    };
  }

  private normalizeLimit(topK?: number) {
    return Math.min(Math.max(Number(topK) || this.defaultTopK, 1), 20);
  }

  private normalizeCandidateLimit(value: number) {
    return Math.min(Math.max(Number(value) || 0, 0), 100);
  }
}
