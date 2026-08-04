import { Injectable } from '@nestjs/common';
import type { RetrievalCandidate } from '../../../../types/rag.type';
import type { RagReranker, RagRerankInput } from './rag-reranker';

/** 根据词项命中、多路召回和文档多样性规则重排候选。 */
@Injectable()
export class RuleBasedReranker implements RagReranker {
  /** 计算规则加权分数并返回前 topK 个候选。 */
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
            rerankMode: 'rule' as const,
          },
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, input.topK);
  }

  /** 从改写查询和原问题中提取去重后的有效词项。 */
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

  /** 统计文本中包含的查询词项数量。 */
  private countHits(value: string, terms: string[]) {
    const normalized = value.toLowerCase();
    return terms.filter((term) => normalized.includes(term)).length;
  }
}
