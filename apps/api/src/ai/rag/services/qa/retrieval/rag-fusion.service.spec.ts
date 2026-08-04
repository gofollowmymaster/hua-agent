import { RagFusionService } from './rag-fusion.service';
import type {
  RagRetrievalRoute,
  RetrievalCandidate,
} from '../../../types/rag.type';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn(() => ({ retrieval: { fusionK: 60 } })),
  },
}));

describe('RagFusionService', () => {
  it('merges duplicate candidates and their generic route diagnostics', () => {
    const service = new RagFusionService();

    const result = service.fuseCandidates([
      [buildCandidate('vector', 0.91, 1)],
      [buildCandidate('keyword', 0.7, 1)],
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '1',
      similarity: 0.91,
      retrieval: {
        routes: ['vector', 'keyword'],
        ranks: { vector: 1, keyword: 1 },
        scores: { vector: 0.91, keyword: 0.7 },
      },
    });
    expect(result[0].retrieval.fusedScore).toBeCloseTo(1 / 61 + 0.8 / 61);
  });

  it('sorts candidates by weighted RRF score', () => {
    const service = new RagFusionService();
    const vector = buildCandidate('vector', 0.8, 2, 'vector-candidate');
    const keyword = buildCandidate('keyword', 0.9, 1, 'keyword-candidate');

    const result = service.fuseCandidates([[vector], [keyword]]);

    expect(result.map((candidate) => candidate.id)).toEqual([
      'vector-candidate',
      'keyword-candidate',
    ]);
  });
});

function buildCandidate(
  route: RagRetrievalRoute,
  score: number,
  rank: number,
  id = '1',
): RetrievalCandidate {
  return {
    id,
    tenantCode: 'aplus',
    documentId: '10',
    fileName: '制度.pdf',
    fileType: 'pdf',
    sourcePath: 'raw/制度.pdf',
    chunkIndex: 0,
    content: '报销审批需要主管确认。',
    metadata: {},
    similarity: route === 'vector' ? score : 0,
    score,
    retrieval: {
      routes: [route],
      ranks: { [route]: rank },
      scores: { [route]: score },
    },
  };
}
