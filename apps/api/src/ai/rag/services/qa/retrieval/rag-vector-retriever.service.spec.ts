import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { RagVectorRetrieverService } from './rag-vector-retriever.service';

const mockEmbedQuery = jest.fn();

jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: mockEmbedQuery,
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: { get: jest.fn(defaultConfigGet) },
}));

describe('RagVectorRetrieverService', () => {
  const logger = { setContext: jest.fn(), warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (NodeConfigService.get as jest.Mock).mockImplementation(defaultConfigGet);
    mockEmbedQuery.mockResolvedValue([0.1, 0.2]);
  });

  it('returns vector candidates with generic route diagnostics', async () => {
    const ragPrisma = { $queryRaw: jest.fn().mockResolvedValue([buildRow()]) };
    const service = new RagVectorRetrieverService(
      ragPrisma as any,
      logger as any,
    );

    const result = await service.retrieve({
      query: '报销审批',
      tenantCode: 'aplus',
    });

    expect(mockEmbedQuery).toHaveBeenCalledWith('报销审批');
    expect(result).toMatchObject({
      route: 'vector',
      status: 'success',
      candidates: [
        {
          tenantCode: 'aplus',
          similarity: 0.91,
          retrieval: {
            routes: ['vector'],
            ranks: { vector: 1 },
            scores: { vector: 0.91 },
          },
        },
      ],
    });
  });

  it('returns failed diagnostics when embedding or SQL fails', async () => {
    mockEmbedQuery.mockRejectedValue(new Error('embedding unavailable'));
    const service = new RagVectorRetrieverService(
      { $queryRaw: jest.fn() } as any,
      logger as any,
    );

    const result = await service.retrieve({
      query: '报销审批',
      tenantCode: 'aplus',
    });

    expect(result).toMatchObject({
      route: 'vector',
      status: 'failed',
      candidates: [],
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG vector retrieval failed',
      undefined,
      expect.objectContaining({ stage: 'rag_vector_retrieval_failed' }),
    );
  });

  it('returns disabled diagnostics when vector retrieval is configured off', async () => {
    (NodeConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'vcHelper') {
        return {
          retrieval: { vectorTopK: 0, keywordTopK: 4, fusionK: 60 },
        };
      }
      return defaultConfigGet(key);
    });
    const ragPrisma = { $queryRaw: jest.fn() };
    const service = new RagVectorRetrieverService(
      ragPrisma as any,
      logger as any,
    );

    const result = await service.retrieve({
      query: '报销审批',
      tenantCode: 'aplus',
    });

    expect(result).toMatchObject({
      route: 'vector',
      status: 'disabled',
      candidates: [],
    });
    expect(mockEmbedQuery).not.toHaveBeenCalled();
    expect(ragPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  afterAll(() => {
    (OpenAIEmbeddings as jest.Mock).mockClear();
  });
});

function defaultConfigGet(key: string) {
  const values: Record<string, unknown> = {
    vcHelper: {
      retrieval: { vectorTopK: 4, keywordTopK: 4, fusionK: 60 },
    },
    embeddingsApiKey: 'embedding-key',
    embeddingsModelName: 'text-embedding-v3',
    embeddingsDimensions: 1024,
    embeddingsBaseUrl: 'https://embedding.test',
  };
  return values[key];
}

function buildRow() {
  return {
    id: BigInt(1),
    tenant_code: 'aplus',
    document_id: BigInt(10),
    chunk_index: 0,
    content: '报销审批需要主管确认。',
    metadata: {},
    file_name: '制度.pdf',
    file_type: 'pdf',
    source_path: 'raw/制度.pdf',
    score: 0.91,
  };
}
