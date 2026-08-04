import { Injectable } from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import type { RagRerankMode } from '@src/config/interface';
import type {
  RetrievalCandidate,
  RetrievedChunk,
} from '../../../../types/rag.type';
import type { RagRerankResult } from '../../../../types/rag-workflow.type';
import type { RagReranker } from './rag-reranker';
import { NoopReranker } from './noop-reranker.service';
import { RuleBasedReranker } from './rule-based-reranker.service';
import { Qwen3Reranker } from './qwen3-reranker.service';

export type RagRerankCandidatesInput = {
  query: string;
  originalQuestion: string;
  candidates: RetrievalCandidate[];
  topK?: number;
  tenantCode: string;
  sessionKey?: string;
  rerankMode?: RagRerankMode;
};

/** 按配置选择重排策略，并为模型或规则失败提供融合结果降级。 */
@Injectable()
export class RagRerankService {
  private readonly defaultTopK: number;
  private readonly retrievalConfig =
    NodeConfigService.get('vcHelper').retrieval;

  constructor(
    private readonly logger: LoggerService,
    private readonly noopReranker: NoopReranker,
    private readonly ruleBasedReranker: RuleBasedReranker,
    private readonly qwen3Reranker: Qwen3Reranker,
  ) {
    this.logger.setContext(RagRerankService.name);
    this.defaultTopK = NodeConfigService.get('vcHelper').defaultTopK;
  }

  /** 执行指定重排模式并统一输出阶段状态、耗时和最终切片。 */
  async rerankCandidates(
    input: RagRerankCandidatesInput,
  ): Promise<RagRerankResult> {
    // rerank 失败仍返回融合排序结果，保证单个后处理节点不会阻断问答。
    const startedAt = Date.now();
    const limit = this.normalizeLimit(input.topK);
    const rerankTopN = Math.min(
      Math.max(this.retrievalConfig.rerankTopN, limit),
      100,
    );
    const candidates = input.candidates.slice(0, rerankTopN);
    const mode = input.rerankMode ?? this.retrievalConfig.rerankMode ?? 'rule';

    if (mode === 'model') {
      return this.rerankWithModel(input, candidates, limit, startedAt);
    }

    const reranker =
      mode === 'none' ? this.noopReranker : this.ruleBasedReranker;
    try {
      return {
        status: mode === 'none' ? 'disabled' : 'success',
        mode,
        chunks: (
          await this.runReranker(reranker, input, candidates, limit)
        ).map((candidate) => this.toRetrievedChunk(candidate)),
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      return this.fallbackToFused(input, mode, limit, startedAt, error);
    }
  }

  /** 优先执行模型重排，失败后依次回退到规则和融合排序。 */
  private async rerankWithModel(
    input: RagRerankCandidatesInput,
    candidates: RetrievalCandidate[],
    limit: number,
    startedAt: number,
  ): Promise<RagRerankResult> {
    try {
      const modelCandidates = await this.runReranker(
        this.qwen3Reranker,
        input,
        candidates,
        limit,
      );
      return {
        status: 'success',
        mode: 'model',
        chunks: modelCandidates.map((candidate) =>
          this.toRetrievedChunk(candidate),
        ),
        durationMs: Date.now() - startedAt,
      };
    } catch (modelError) {
      this.logger.warn('RAG model rerank failed, fallback to rule', undefined, {
        stage: 'rag_model_rerank_failed_fallback',
        tenantCode: input.tenantCode,
        sessionKey: input.sessionKey,
        rerankMode: 'model',
        fallbackMode: 'rule',
        errorType: this.errorType(modelError),
      });
    }

    try {
      const ruleCandidates = await this.runReranker(
        this.ruleBasedReranker,
        input,
        candidates,
        limit,
      );
      return {
        status: 'failed',
        mode: 'model',
        fallbackMode: 'rule',
        chunks: ruleCandidates.map((candidate) =>
          this.toRetrievedChunk(candidate),
        ),
        durationMs: Date.now() - startedAt,
      };
    } catch (ruleError) {
      return this.fallbackToFused(
        input,
        'model',
        limit,
        startedAt,
        ruleError,
        'rule',
      );
    }
  }

  /** 将统一输入转换为具体重排器契约并执行。 */
  private runReranker(
    reranker: RagReranker,
    input: RagRerankCandidatesInput,
    candidates: RetrievalCandidate[],
    topK: number,
  ) {
    return reranker.rerank({
      query: input.query,
      originalQuestion: input.originalQuestion,
      candidates,
      topK,
      tenantCode: input.tenantCode,
      sessionKey: input.sessionKey,
    });
  }

  /** 记录重排失败并以融合顺序返回有限数量的候选。 */
  private fallbackToFused(
    input: RagRerankCandidatesInput,
    mode: RagRerankMode,
    limit: number,
    startedAt: number,
    error: unknown,
    fallbackMode?: 'rule',
  ): RagRerankResult {
    this.logger.warn(
      'RAG rerank failed, fallback to fused candidates',
      undefined,
      {
        stage: 'rag_rerank_failed_fallback',
        tenantCode: input.tenantCode,
        sessionKey: input.sessionKey,
        rerankMode: mode,
        fallbackMode,
        errorType: this.errorType(error),
      },
    );

    return {
      status: 'failed',
      mode,
      fallbackMode,
      chunks: input.candidates
        .slice(0, limit)
        .map((candidate) => this.toRetrievedChunk(candidate)),
      durationMs: Date.now() - startedAt,
    };
  }

  /** 将未知异常归一为可记录的错误类型。 */
  private errorType(error: unknown) {
    return error instanceof Error ? error.constructor.name : typeof error;
  }

  /** 将内部候选映射为问答工作流消费的检索切片。 */
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
      similarity: candidate.retrieval.scores.vector ?? candidate.similarity,
      score: candidate.score,
      retrieval: candidate.retrieval,
    };
  }

  /** 将请求数量规范到允许范围并应用默认值。 */
  private normalizeLimit(topK?: number) {
    return Math.min(Math.max(Number(topK) || this.defaultTopK, 1), 20);
  }
}
