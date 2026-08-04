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

export abstract class BaseRagRetriever implements RagRetriever {
  protected constructor(
    protected readonly logger: LoggerService,
    public readonly route: RagRetrievalRoute,
    private readonly candidateLimit: number,
    private readonly failureMessage: string,
    private readonly failureStage: string,
  ) {
    this.logger.setContext(this.constructor.name);
  }

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

  protected isDisabled(_input: RagRetrieveInput): boolean {
    return false;
  }

  protected abstract retrieveCandidates(
    input: RagRetrieveInput,
    limit: number,
  ): Promise<RetrievalCandidate[]>;

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

  private normalizeCandidateLimit(value: number) {
    return Math.min(Math.max(Number(value) || 0, 0), 100);
  }
}
