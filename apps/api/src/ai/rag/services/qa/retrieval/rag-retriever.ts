import { LoggerService } from '@src/common/service/logger/logger.service';
import type {
  RagRetrievalRoute,
  RetrievalCandidate,
} from '../../../types/rag.type';
import type {
  RagRetrievalRouteResult,
  RagStageStatus,
} from '../../../types/rag-workflow.type';

export type RagRetrieveInput = {
  query: string;
  tenantCode: string;
};

export type RagRetrievalRow = {
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

export interface RagRetriever {
  readonly route: RagRetrievalRoute;
  retrieve(input: RagRetrieveInput): Promise<RagRetrievalRouteResult>;
}

/** 封装检索路由通用的限额、禁用判断、异常降级和结果映射。 */
export abstract class BaseRagRetriever implements RagRetriever {
  /** 注入具体检索策略的路由标识、候选上限和失败日志上下文。 */
  protected constructor(
    protected readonly logger: LoggerService,
    public readonly route: RagRetrievalRoute,
    private readonly candidateLimit: number,
    private readonly failureMessage: string,
    private readonly failureStage: string,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /** 执行具体检索策略并将禁用或异常统一转换为阶段结果。 */
  async retrieve(input: RagRetrieveInput): Promise<RagRetrievalRouteResult> {
    const startedAt = Date.now();
    const limit = this.normalizeCandidateLimit(this.candidateLimit);
    if (limit <= 0 || this.isDisabled(input)) {
      return this.buildResult('disabled', [], startedAt);
    }

    try {
      const candidates = await this.retrieveCandidates(input, limit);
      return this.buildResult('success', candidates, startedAt);
    } catch (error) {
      this.logger.warn(this.failureMessage, undefined, {
        stage: this.failureStage,
        tenantCode: input.tenantCode,
        error: error instanceof Error ? error.message : String(error),
      });
      return this.buildResult('failed', [], startedAt);
    }
  }

  /** 允许具体检索器根据输入动态关闭当前路由。 */
  protected isDisabled(_input: RagRetrieveInput): boolean {
    return false;
  }

  /** 由具体检索器实现候选查询和初始排序。 */
  protected abstract retrieveCandidates(
    input: RagRetrieveInput,
    limit: number,
  ): Promise<RetrievalCandidate[]>;

  /** 将数据库检索行转换为统一候选并记录路由排名与分数。 */
  protected toCandidate(
    row: RagRetrievalRow,
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
      similarity: this.route === 'vector' ? score : 0,
      score,
      retrieval: {
        routes: [this.route],
        ranks: { [this.route]: rank },
        scores: { [this.route]: score },
      },
    };
  }

  /** 构造带阶段状态和耗时的检索路由结果。 */
  private buildResult(
    status: RagStageStatus,
    candidates: RetrievalCandidate[],
    startedAt: number,
  ): RagRetrievalRouteResult {
    return {
      route: this.route,
      status,
      candidates,
      durationMs: Date.now() - startedAt,
    };
  }

  /** 将候选上限规范到数据库查询允许的安全范围。 */
  private normalizeCandidateLimit(value: number) {
    return Math.min(Math.max(Number(value) || 0, 0), 100);
  }
}
