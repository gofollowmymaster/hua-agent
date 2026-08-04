import { Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import type { RagRerankMode } from '@src/config/interface';
import type {
  RetrievalCandidate,
  RetrievedChunk,
} from '../../../types/rag.type';
import type {
  RagRerankResult,
  RagRetrievalRouteResult,
} from '../../../types/rag-workflow.type';
import { RagVectorRetrieverService } from './rag-vector-retriever.service';
import { RagFullTextRetrieverService } from './rag-full-text-retriever.service';
import { RagFusionService } from './rag-fusion.service';
import {
  RagRerankService,
  type RagRerankCandidatesInput,
} from './rerank/rag-rerank.service';

@Injectable()
export class RagRetrievalService {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly vectorRetriever: RagVectorRetrieverService,
    private readonly fullTextRetriever: RagFullTextRetrieverService,
    private readonly fusionService: RagFusionService,
    private readonly rerankService: RagRerankService,
  ) {}

  async retrieve(input: {
    query: string;
    originalQuestion?: string;
    topK?: number;
    sessionKey?: string;
    rerankMode?: RagRerankMode;
  }): Promise<RetrievedChunk[]> {
    const tenantCode = this.tenantContext.tenant;
    const [vectorResult, keywordResult] = await Promise.all([
      this.retrieveVector({ query: input.query, tenantCode }),
      this.retrieveKeyword({ query: input.query, tenantCode }),
    ]);
    const fusedCandidates = this.fuseCandidates([
      vectorResult.candidates,
      keywordResult.candidates,
    ]);

    return (
      await this.rerankCandidates({
        query: input.query,
        originalQuestion: input.originalQuestion ?? input.query,
        candidates: fusedCandidates,
        topK: input.topK,
        tenantCode,
        sessionKey: input.sessionKey,
        rerankMode: input.rerankMode,
      })
    ).chunks;
  }

  retrieveVector(input: {
    query: string;
    tenantCode: string;
  }): Promise<RagRetrievalRouteResult> {
    return this.vectorRetriever.retrieve(input);
  }

  retrieveKeyword(input: {
    query: string;
    tenantCode: string;
  }): Promise<RagRetrievalRouteResult> {
    return this.fullTextRetriever.retrieve(input);
  }

  fuseCandidates(
    candidateGroups: RetrievalCandidate[][],
  ): RetrievalCandidate[] {
    return this.fusionService.fuseCandidates(candidateGroups);
  }

  rerankCandidates(input: RagRerankCandidatesInput): Promise<RagRerankResult> {
    return this.rerankService.rerankCandidates(input);
  }
}
