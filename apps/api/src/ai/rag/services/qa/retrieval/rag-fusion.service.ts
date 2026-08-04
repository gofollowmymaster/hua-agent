import { Injectable } from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import type {
  RagRetrievalRoute,
  RetrievalCandidate,
} from '../../../types/rag.type';

/** 使用加权倒数排名融合多个检索路由的候选结果。 */
@Injectable()
export class RagFusionService {
  private readonly fusionK = Math.max(
    NodeConfigService.get('vcHelper').retrieval.fusionK,
    1,
  );

  /** 合并同一切片的多路排名和分数，并按融合分数降序输出。 */
  fuseCandidates(
    candidateGroups: RetrievalCandidate[][],
  ): RetrievalCandidate[] {
    const candidateMap = new Map<string, RetrievalCandidate>();

    for (const candidates of candidateGroups) {
      for (const candidate of candidates) {
        const route = candidate.retrieval.routes[0];
        const current = candidateMap.get(candidate.id);
        const routeRank = candidate.retrieval.ranks[route] ?? 1;
        const rrfScore = this.routeWeight(route) / (this.fusionK + routeRank);

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

        const fusedScore =
          (current.retrieval.fusedScore ?? current.score) + rrfScore;
        const scores = {
          ...current.retrieval.scores,
          ...candidate.retrieval.scores,
        };
        candidateMap.set(candidate.id, {
          ...current,
          score: fusedScore,
          similarity: scores.vector ?? current.similarity,
          retrieval: {
            routes: Array.from(
              new Set([
                ...current.retrieval.routes,
                ...candidate.retrieval.routes,
              ]),
            ),
            ranks: {
              ...current.retrieval.ranks,
              ...candidate.retrieval.ranks,
            },
            scores,
            fusedScore,
          },
        });
      }
    }

    return Array.from(candidateMap.values()).sort(
      (left, right) => right.score - left.score,
    );
  }

  /** 返回检索路由在融合计算中的业务权重。 */
  private routeWeight(route: RagRetrievalRoute) {
    if (route === 'keyword') return 0.8;
    return 1;
  }
}
