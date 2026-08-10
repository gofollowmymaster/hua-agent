import { AgentKnowledgeSearchService } from './agent-knowledge-search.service';

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
        embeddingsApiKey: 'test-key',
        embeddingsModelName: 'test-model',
        embeddingsDimensions: 2,
        embeddingsBaseUrl: 'http://localhost',
      };
      return values[key];
    }),
  },
}));

describe('AgentKnowledgeSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmbedQuery.mockResolvedValue([0.1, 0.2]);
  });

  it('returns fulltext hits for the current tenant', async () => {
    const ragPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([buildRow()]),
    };
    const service = new AgentKnowledgeSearchService(ragPrisma as any);

    const result = await service.search('报销', {
      tenantCode: 'yurex',
      mode: 'fulltext',
      category: 'yurex',
      topK: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tenantCode: 'yurex',
      category: 'yurex',
      fileName: 'guide.md',
      sourcePath: 'yurex/guide.md',
    });
    expect(ragPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns vector hits using query embedding', async () => {
    const ragPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([buildRow({ score: 0.91 })]),
    };
    const service = new AgentKnowledgeSearchService(ragPrisma as any);

    const result = await service.search('报销流程', {
      tenantCode: 'yurex',
      mode: 'vector',
      topK: 5,
    });

    expect(mockEmbedQuery).toHaveBeenCalledWith('报销流程');
    expect(result[0].score).toBe(0.91);
  });

  it('merges fulltext and vector candidates in hybrid mode', async () => {
    const ragPrisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([buildRow({ id: BigInt(1) })])
        .mockResolvedValueOnce([buildRow({ id: BigInt(2), score: 0.9 })]),
    };
    const service = new AgentKnowledgeSearchService(ragPrisma as any);

    const result = await service.search('报销流程', {
      tenantCode: 'yurex',
      mode: 'hybrid',
      topK: 5,
    });

    expect(ragPrisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });
});

function buildRow(overrides: Record<string, unknown> = {}) {
  return {
    id: BigInt(1),
    tenant_code: 'yurex',
    document_id: BigInt(10),
    chunk_index: 0,
    content: '报销审批需要主管确认。',
    metadata: {},
    category: 'yurex',
    file_name: 'guide.md',
    source_path: 'yurex/guide.md',
    remote_url: 'https://example.com',
    doc_id: 'doc-1',
    wiki_node_id: 'node-1',
    last_modified_at: '2026-08-06',
    breadcrumb: 'Yurex经验分享',
    source_type: 'feishu-doc',
    current_version: 'v1.0.0',
    score: 0.8,
    ...overrides,
  };
}
