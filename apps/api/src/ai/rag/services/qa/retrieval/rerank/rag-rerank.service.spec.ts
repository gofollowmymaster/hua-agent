import { NodeConfigService } from '@src/config/node-config.service';
import { RagRerankService } from './rag-rerank.service';
import { NoopReranker } from './noop-reranker.service';
import { RuleBasedReranker } from './rule-based-reranker.service';
import type { RetrievalCandidate } from '../../../../types/rag.type';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: { get: jest.fn() },
}));

describe('RagRerankService', () => {
  const logger = { setContext: jest.fn(), warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig('rule');
  });

  it('applies rule reranking and keeps the generic route scores', async () => {
    const service = buildService();

    const result = await service.rerankCandidates(buildInput());

    expect(result).toMatchObject({ status: 'success', mode: 'rule' });
    expect(result.chunks[0]).toMatchObject({
      similarity: 0.9,
      retrieval: {
        scores: { vector: 0.9 },
        rerankMode: 'rule',
      },
    });
  });

  it('lets a request mode override the global mode', async () => {
    mockConfig('rule');
    const qwen3Reranker = { rerank: jest.fn().mockResolvedValue([]) };
    const service = buildService(undefined, qwen3Reranker);

    const result = await service.rerankCandidates({
      ...buildInput(),
      rerankMode: 'model',
    });

    expect(qwen3Reranker.rerank).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: 'success', mode: 'model' });
  });

  it('limits model input candidates with rerankTopN', async () => {
    const qwen3Reranker = { rerank: jest.fn().mockResolvedValue([]) };
    const service = buildService(undefined, qwen3Reranker);

    await service.rerankCandidates({
      ...buildInput(),
      candidates: Array.from({ length: 6 }, (_, index) =>
        buildCandidate(String(index)),
      ),
      topK: 2,
      rerankMode: 'model',
    });

    expect(qwen3Reranker.rerank).toHaveBeenCalledWith(
      expect.objectContaining({
        candidates: expect.arrayContaining([
          expect.objectContaining({ id: '0' }),
          expect.objectContaining({ id: '3' }),
        ]),
        topK: 2,
      }),
    );
    expect(qwen3Reranker.rerank.mock.calls[0][0].candidates).toHaveLength(4);
  });

  it('returns disabled diagnostics in none mode', async () => {
    const service = buildService();

    const result = await service.rerankCandidates({
      ...buildInput(),
      rerankMode: 'none',
    });

    expect(result).toMatchObject({ status: 'disabled', mode: 'none' });
    expect(result.chunks).toHaveLength(1);
  });

  it('falls back from model to rule while preserving failed diagnostics', async () => {
    mockConfig('model');
    const qwen3Reranker = {
      rerank: jest.fn().mockRejectedValue(new Error('unavailable')),
    };
    const service = buildService(undefined, qwen3Reranker);

    const result = await service.rerankCandidates(buildInput());

    expect(result).toMatchObject({
      status: 'failed',
      mode: 'model',
      fallbackMode: 'rule',
    });
    expect(result.chunks[0].retrieval.rerankMode).toBe('rule');
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG model rerank failed, fallback to rule',
      undefined,
      expect.objectContaining({
        stage: 'rag_model_rerank_failed_fallback',
        errorType: 'Error',
      }),
    );
    expect(JSON.stringify(logger.warn.mock.calls[0][2])).not.toContain(
      '报销审批',
    );
    expect(logger.warn.mock.calls[0][2]).not.toHaveProperty('query');
  });

  it('falls back to fused candidates when model and rule both fail', async () => {
    const ruleReranker = new RuleBasedReranker();
    jest
      .spyOn(ruleReranker, 'rerank')
      .mockRejectedValue(new Error('rule down'));
    const service = buildService(ruleReranker, {
      rerank: jest.fn().mockRejectedValue(new Error('model down')),
    });

    const result = await service.rerankCandidates({
      ...buildInput(),
      rerankMode: 'model',
      sessionKey: 'session-1',
    });

    expect(result).toMatchObject({
      status: 'failed',
      mode: 'model',
      fallbackMode: 'rule',
    });
    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0].retrieval.rerankMode).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG rerank failed, fallback to fused candidates',
      undefined,
      expect.objectContaining({
        stage: 'rag_rerank_failed_fallback',
        errorType: 'Error',
      }),
    );
  });

  it('falls back directly to fused candidates when rule mode fails', async () => {
    const ruleReranker = new RuleBasedReranker();
    jest
      .spyOn(ruleReranker, 'rerank')
      .mockRejectedValue(new Error('rule down'));
    const service = buildService(ruleReranker);

    const result = await service.rerankCandidates(buildInput());

    expect(result).toMatchObject({ status: 'failed', mode: 'rule' });
    expect(result.fallbackMode).toBeUndefined();
    expect(result.chunks).toHaveLength(1);
  });

  function buildService(
    ruleReranker: RuleBasedReranker = new RuleBasedReranker(),
    qwen3Reranker: { rerank: jest.Mock } = {
      rerank: jest.fn().mockResolvedValue([]),
    },
  ) {
    return new RagRerankService(
      logger as any,
      new NoopReranker(),
      ruleReranker,
      qwen3Reranker as any,
    );
  }
});

function mockConfig(rerankMode: 'none' | 'rule' | 'model') {
  (NodeConfigService.get as jest.Mock).mockReturnValue({
    defaultTopK: 8,
    retrieval: {
      vectorTopK: 4,
      keywordTopK: 4,
      fusionK: 60,
      rerankMode,
      rerankTopN: 4,
    },
  });
}

function buildInput() {
  return {
    query: '报销审批',
    originalQuestion: '审批呢？',
    candidates: [buildCandidate()],
    topK: 1,
    tenantCode: 'aplus',
  };
}

function buildCandidate(id = '1'): RetrievalCandidate {
  return {
    id,
    tenantCode: 'aplus',
    documentId: '10',
    fileName: '报销制度.pdf',
    fileType: 'pdf',
    sourcePath: 'raw/报销制度.pdf',
    chunkIndex: 0,
    content: '报销审批需要主管确认。',
    metadata: {},
    similarity: 0.9,
    score: 0.02,
    retrieval: {
      routes: ['vector'],
      ranks: { vector: 1 },
      scores: { vector: 0.9 },
      fusedScore: 0.02,
    },
  };
}
