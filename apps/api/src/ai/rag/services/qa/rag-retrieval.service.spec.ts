import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { RagRetrievalService } from './rag-retrieval.service';

const mockEmbedQuery = jest.fn();

jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: mockEmbedQuery,
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        vcHelper: {
          defaultTopK: 8,
          retrieval: {
            vectorTopK: 4,
            keywordTopK: 4,
            fusionK: 60,
            rerankMode: 'rule',
            rerankTopN: 4,
          },
        },
        embeddingsApiKey: 'embedding-key',
        embeddingsModelName: 'text-embedding-v3',
        embeddingsDimensions: 1024,
        embeddingsBaseUrl: 'https://embedding.test',
      };
      return values[key];
    }),
  },
}));

describe('RagRetrievalService', () => {
  let ragPrisma: { $queryRaw: jest.Mock };
  let logger: { setContext: jest.Mock; warn: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    (NodeConfigService.get as jest.Mock).mockImplementation(defaultConfigGet);
    mockEmbedQuery.mockResolvedValue([0.1, 0.2, 0.3]);
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
    };
  });

  it('merges duplicate chunks from vector and keyword retrieval with route traces', async () => {
    ragPrisma = {
      $queryRaw: jest.fn((strings: TemplateStringsArray) => {
        const sql = Array.from(strings).join('');
        if (sql.includes('ts_debug')) {
          return Promise.resolve([
            buildRow({
              id: 1,
              score: 0.7,
              content: '报销审批需要主管确认。',
            }),
          ]);
        }

        return Promise.resolve([
          buildRow({
            id: 1,
            score: 0.91,
            content: '报销审批需要主管确认。',
          }),
          buildRow({
            id: 2,
            score: 0.88,
            content: '差旅报销单需要附件。',
          }),
        ]);
      }),
    };

    const service = new RagRetrievalService(
      ragPrisma as any,
      logger as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.retrieve({
      query: '报销审批流程',
      originalQuestion: '审批呢？',
      topK: 2,
      sessionKey: 'session-1',
    });

    expect(mockEmbedQuery).toHaveBeenCalledWith('报销审批流程');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '1',
      tenantCode: 'aplus',
      retrieval: {
        routes: ['vector', 'keyword'],
        vectorRank: 1,
        keywordRank: 1,
        rerankMode: 'rule',
      },
    });
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });

  it('falls back to vector candidates when keyword retrieval fails', async () => {
    ragPrisma = {
      $queryRaw: jest.fn((strings: TemplateStringsArray) => {
        const sql = Array.from(strings).join('');
        if (sql.includes('ts_debug')) {
          return Promise.reject(new Error('zhparser unavailable'));
        }

        return Promise.resolve([
          buildRow({
            id: 2,
            score: 0.88,
            content: '差旅报销单需要附件。',
          }),
        ]);
      }),
    };

    const service = new RagRetrievalService(
      ragPrisma as any,
      logger as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.retrieve({
      query: '差旅报销',
      topK: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].retrieval?.routes).toEqual(['vector']);
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG keyword retrieval failed',
      undefined,
      expect.objectContaining({
        stage: 'rag_keyword_retrieval_failed',
      }),
    );
  });

  it('returns failed route diagnostics when keyword retrieval fails', async () => {
    ragPrisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('zhparser unavailable')),
    };
    const service = new RagRetrievalService(
      ragPrisma as any,
      logger as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.retrieveKeyword({
      query: '差旅报销',
      tenantCode: 'aplus',
    });

    expect(result).toMatchObject({
      route: 'keyword',
      status: 'failed',
      candidates: [],
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('supports none rerank mode through the reranker abstraction', async () => {
    (NodeConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'vcHelper') {
        return {
          defaultTopK: 8,
          retrieval: {
            vectorTopK: 4,
            keywordTopK: 0,
            fusionK: 60,
            rerankMode: 'none',
            rerankTopN: 4,
          },
        };
      }

      const values: Record<string, unknown> = {
        embeddingsApiKey: 'embedding-key',
        embeddingsModelName: 'text-embedding-v3',
        embeddingsDimensions: 1024,
        embeddingsBaseUrl: 'https://embedding.test',
      };
      return values[key];
    });
    ragPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        buildRow({
          id: 3,
          score: 0.9,
          content: '采购审批流程。',
        }),
      ]),
    };

    const service = new RagRetrievalService(
      ragPrisma as any,
      logger as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.retrieve({
      query: '采购审批',
      topK: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].retrieval?.rerankMode).toBeUndefined();
  });

  it('returns fused candidates with failed diagnostics when rerank fails', async () => {
    ragPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        buildRow({
          id: 4,
          score: 0.87,
          content: '合同审批流程。',
        }),
      ]),
    };
    const service = new RagRetrievalService(
      ragPrisma as any,
      logger as any,
      { tenant: 'aplus' } as any,
    );
    const vectorResult = await service.retrieveVector({
      query: '合同审批',
      tenantCode: 'aplus',
    });
    const fusedCandidates = service.fuseCandidates([vectorResult.candidates]);
    jest
      .spyOn((service as any).ruleBasedReranker, 'rerank')
      .mockRejectedValue(new Error('rerank unavailable'));

    const result = await service.rerankCandidates({
      query: '合同审批',
      originalQuestion: '合同怎么审批？',
      candidates: fusedCandidates,
      topK: 1,
      tenantCode: 'aplus',
      sessionKey: 'session-1',
    });

    expect(result.status).toBe('failed');
    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0].id).toBe('4');
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG rerank failed, fallback to fused candidates',
      undefined,
      expect.objectContaining({ stage: 'rag_rerank_failed_fallback' }),
    );
  });

  afterAll(() => {
    (OpenAIEmbeddings as jest.Mock).mockClear();
  });
});

function defaultConfigGet(key: string) {
  const values: Record<string, unknown> = {
    vcHelper: {
      defaultTopK: 8,
      retrieval: {
        vectorTopK: 4,
        keywordTopK: 4,
        fusionK: 60,
        rerankMode: 'rule',
        rerankTopN: 4,
      },
    },
    embeddingsApiKey: 'embedding-key',
    embeddingsModelName: 'text-embedding-v3',
    embeddingsDimensions: 1024,
    embeddingsBaseUrl: 'https://embedding.test',
  };
  return values[key];
}

function buildRow(params: { id: number; score: number; content: string }) {
  return {
    id: BigInt(params.id),
    tenant_code: 'aplus',
    document_id: BigInt(10),
    chunk_index: params.id - 1,
    content: params.content,
    metadata: {},
    file_name: '制度.pdf',
    file_type: 'pdf',
    source_path: 'raw/制度.pdf',
    score: params.score,
  };
}
