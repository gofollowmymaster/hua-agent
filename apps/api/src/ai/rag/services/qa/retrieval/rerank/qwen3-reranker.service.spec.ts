import { of } from 'rxjs';
import { NodeConfigService } from '@src/config/node-config.service';
import { Qwen3Reranker } from './qwen3-reranker.service';
import type { RetrievalCandidate } from '../../../../types/rag.type';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: { get: jest.fn() },
}));

describe('Qwen3Reranker', () => {
  const httpService = { post: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig();
  });

  it('sends the native DashScope request and maps scores in response order', async () => {
    httpService.post.mockReturnValue(
      of({
        status: 200,
        data: {
          output: {
            results: [
              { index: 1, relevance_score: 0.96 },
              { index: 0, relevance_score: 0.72 },
            ],
          },
        },
      }),
    );
    const service = new Qwen3Reranker(httpService as any);
    const candidates = [buildCandidate('1'), buildCandidate('2')];

    const result = await service.rerank({
      query: '报销审批',
      originalQuestion: '审批呢？',
      candidates,
      topK: 2,
      tenantCode: 'aplus',
    });

    expect(httpService.post).toHaveBeenCalledWith(
      'https://dashscope.test/rerank',
      {
        model: 'qwen3-rerank',
        input: {
          query: '报销审批',
          documents: candidates.map((candidate) => candidate.content),
        },
        parameters: { return_documents: false, top_n: 2 },
      },
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer rerank-key',
          'Content-Type': 'application/json',
        },
        timeout: 4321,
        validateStatus: expect.any(Function),
      }),
    );
    expect(result.map((candidate) => candidate.id)).toEqual(['2', '1']);
    expect(result.map((candidate) => candidate.score)).toEqual([0.96, 0.72]);
    expect(result[0].retrieval).toMatchObject({
      rerankScore: 0.96,
      rerankMode: 'model',
    });
  });

  it('returns empty candidates without reading config or calling DashScope', async () => {
    const service = new Qwen3Reranker(httpService as any);

    const result = await service.rerank({
      query: '报销审批',
      originalQuestion: '审批呢？',
      candidates: [],
      topK: 2,
      tenantCode: 'aplus',
    });

    expect(result).toEqual([]);
    expect(NodeConfigService.get).not.toHaveBeenCalled();
    expect(httpService.post).not.toHaveBeenCalled();
  });

  it.each([
    ['non-2xx', { status: 503, data: {} }],
    ['missing results', { status: 200, data: { output: {} } }],
    ['empty results', { status: 200, data: { output: { results: [] } } }],
    [
      'out-of-range index',
      {
        status: 200,
        data: { output: { results: [{ index: 2, relevance_score: 0.9 }] } },
      },
    ],
    [
      'duplicate index',
      {
        status: 200,
        data: {
          output: {
            results: [
              { index: 0, relevance_score: 0.9 },
              { index: 0, relevance_score: 0.8 },
            ],
          },
        },
      },
    ],
    [
      'invalid score',
      {
        status: 200,
        data: {
          output: { results: [{ index: 0, relevance_score: Number.NaN }] },
        },
      },
    ],
  ])('rejects an invalid response: %s', async (_name, response) => {
    httpService.post.mockReturnValue(of(response));
    const service = new Qwen3Reranker(httpService as any);

    await expect(service.rerank(buildInput())).rejects.toThrow();
  });

  it.each([
    ['rerankUrl', ''],
    ['rerankApiKey', ''],
  ])('rejects missing %s without calling DashScope', async (key, value) => {
    mockConfig({ [key]: value });
    const service = new Qwen3Reranker(httpService as any);

    await expect(service.rerank(buildInput())).rejects.toThrow();
    expect(httpService.post).not.toHaveBeenCalled();
  });
});

function mockConfig(overrides: Record<string, unknown> = {}) {
  const config = {
    rerankUrl: 'https://dashscope.test/rerank',
    rerankApiKey: 'rerank-key',
    rerankModel: 'qwen3-rerank',
    rerankTimeoutMs: 4321,
    ...overrides,
  };
  (NodeConfigService.get as jest.Mock).mockImplementation(
    (key: keyof typeof config) => config[key],
  );
}

function buildInput() {
  return {
    query: '报销审批',
    originalQuestion: '审批呢？',
    candidates: [buildCandidate('1')],
    topK: 1,
    tenantCode: 'aplus',
  };
}

function buildCandidate(id: string): RetrievalCandidate {
  return {
    id,
    tenantCode: 'aplus',
    documentId: `document-${id}`,
    fileName: `${id}.pdf`,
    fileType: 'pdf',
    sourcePath: `raw/${id}.pdf`,
    chunkIndex: 0,
    content: `候选正文 ${id}`,
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
