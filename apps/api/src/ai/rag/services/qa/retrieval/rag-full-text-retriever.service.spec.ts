import { RagFullTextRetrieverService } from './rag-full-text-retriever.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn(() => ({
      retrieval: { vectorTopK: 4, keywordTopK: 4, fusionK: 60 },
    })),
  },
}));

describe('RagFullTextRetrieverService', () => {
  const logger = { setContext: jest.fn(), warn: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('returns keyword candidates with generic route diagnostics', async () => {
    const ragPrisma = { $queryRaw: jest.fn().mockResolvedValue([buildRow()]) };
    const service = new RagFullTextRetrieverService(
      ragPrisma as any,
      logger as any,
    );

    const result = await service.retrieve({
      query: ' 报销审批 ',
      tenantCode: 'aplus',
    });

    expect(result).toMatchObject({
      route: 'keyword',
      status: 'success',
      candidates: [
        {
          tenantCode: 'aplus',
          similarity: 0,
          retrieval: {
            routes: ['keyword'],
            ranks: { keyword: 1 },
            scores: { keyword: 0.7 },
          },
        },
      ],
    });
  });

  it('returns disabled diagnostics for an empty query', async () => {
    const ragPrisma = { $queryRaw: jest.fn() };
    const service = new RagFullTextRetrieverService(
      ragPrisma as any,
      logger as any,
    );

    const result = await service.retrieve({ query: '  ', tenantCode: 'aplus' });

    expect(result).toMatchObject({
      route: 'keyword',
      status: 'disabled',
      candidates: [],
    });
    expect(ragPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('returns failed diagnostics when full-text SQL fails', async () => {
    const service = new RagFullTextRetrieverService(
      {
        $queryRaw: jest
          .fn()
          .mockRejectedValue(new Error('zhparser unavailable')),
      } as any,
      logger as any,
    );

    const result = await service.retrieve({
      query: '报销审批',
      tenantCode: 'aplus',
    });

    expect(result).toMatchObject({
      route: 'keyword',
      status: 'failed',
      candidates: [],
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'RAG keyword retrieval failed',
      undefined,
      expect.objectContaining({ stage: 'rag_keyword_retrieval_failed' }),
    );
  });
});

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
    score: 0.7,
  };
}
