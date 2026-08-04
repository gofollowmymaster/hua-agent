import { RagRetrievalService } from './rag-retrieval.service';

describe('RagRetrievalService', () => {
  it('delegates every retrieval stage to its specialized service', async () => {
    const candidate = buildCandidate();
    const vectorResult = {
      route: 'vector' as const,
      status: 'success' as const,
      candidates: [candidate],
      durationMs: 1,
    };
    const keywordResult = {
      route: 'keyword' as const,
      status: 'success' as const,
      candidates: [],
      durationMs: 1,
    };
    const vectorRetriever = {
      retrieve: jest.fn().mockResolvedValue(vectorResult),
    };
    const fullTextRetriever = {
      retrieve: jest.fn().mockResolvedValue(keywordResult),
    };
    const fusionService = {
      fuseCandidates: jest.fn().mockReturnValue([candidate]),
    };
    const rerankService = {
      rerankCandidates: jest.fn().mockResolvedValue({
        status: 'success',
        mode: 'model',
        chunks: [candidate],
        durationMs: 1,
      }),
    };
    const service = new RagRetrievalService(
      { tenant: 'aplus' } as any,
      vectorRetriever as any,
      fullTextRetriever as any,
      fusionService as any,
      rerankService as any,
    );

    const result = await service.retrieve({
      query: '报销审批',
      originalQuestion: '审批呢？',
      topK: 2,
      sessionKey: 'session-1',
      rerankMode: 'model',
    });

    expect(vectorRetriever.retrieve).toHaveBeenCalledWith({
      query: '报销审批',
      tenantCode: 'aplus',
    });
    expect(fullTextRetriever.retrieve).toHaveBeenCalledWith({
      query: '报销审批',
      tenantCode: 'aplus',
    });
    expect(fusionService.fuseCandidates).toHaveBeenCalledWith([
      [candidate],
      [],
    ]);
    expect(rerankService.rerankCandidates).toHaveBeenCalledWith({
      query: '报销审批',
      originalQuestion: '审批呢？',
      candidates: [candidate],
      topK: 2,
      tenantCode: 'aplus',
      sessionKey: 'session-1',
      rerankMode: 'model',
    });
    expect(result).toEqual([candidate]);
  });
});

function buildCandidate() {
  return {
    id: '1',
    tenantCode: 'aplus',
    documentId: '10',
    fileName: '制度.pdf',
    fileType: 'pdf',
    sourcePath: 'raw/制度.pdf',
    chunkIndex: 0,
    content: '报销审批需要主管确认。',
    metadata: {},
    similarity: 0.9,
    score: 0.9,
    retrieval: {
      routes: ['vector' as const],
      ranks: { vector: 1 },
      scores: { vector: 0.9 },
    },
  };
}
