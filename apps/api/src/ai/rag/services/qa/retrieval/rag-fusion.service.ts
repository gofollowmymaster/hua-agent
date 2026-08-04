import { Injectable } from '@nestjs/common';
import { NodeConfigService } from '@src/config/node-config.service';
import type {
  RagRetrievalRoute,
  RetrievalCandidate,
} from '../../../types/rag.type';

@Injectable()
export class RagFusionService {
  private readonly fusionK = Math.max(
    NodeConfigService.get('vcHelper').retrieval.fusionK,
    1,
  );

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

  private routeWeight(route: RagRetrievalRoute) {
    if (route === 'keyword') return 0.8;
    return 1;
  }
}
