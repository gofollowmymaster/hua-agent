import { AgentChatToolService } from './agent-chat-tool.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'defaultTenant') return 'yurex';
      return undefined;
    }),
  },
}));

describe('AgentChatToolService', () => {
  let knowledgeSearchService: { search: jest.Mock };
  let knowledgeService: {
    getDocument: jest.Mock;
    pageDocumentChunks: jest.Mock;
  };
  let tenantContext: { tenant?: string };
  let service: AgentChatToolService;

  beforeEach(() => {
    knowledgeSearchService = {
      search: jest.fn().mockResolvedValue([
        {
          id: '1',
          category: '业务流程',
          fileName: 'guide.md',
          sourcePath: 'yurex/Yurex业务流程/guide.md',
          remoteUrl: null,
          breadcrumb: '业务流程',
          score: 0.9,
          content: '业务内容',
        },
      ]),
    };
    knowledgeService = {
      getDocument: jest.fn().mockResolvedValue({
        id: '1',
        category: '业务流程',
        fileName: 'guide.md',
        sourcePath: 'yurex/Yurex业务流程/guide.md',
        status: 'ready',
        chunkCount: 2,
        actualChunkCount: 2,
        breadcrumb: null,
        remoteUrl: null,
        updatedAt: '2026-01-01',
      }),
      pageDocumentChunks: jest.fn().mockResolvedValue({
        total: 1,
        list: [
          {
            id: '1',
            chunkIndex: 0,
            content: '切片内容',
            metadata: {},
          },
        ],
      }),
    };
    tenantContext = { tenant: 'yurex' };
    service = new AgentChatToolService(
      knowledgeSearchService as any,
      knowledgeService as any,
      tenantContext as any,
    );
  });

  it('executes knowledge search tool', async () => {
    const result = await service.execute('search_knowledge', {
      query: 'PO 订单',
      topK: 5,
    });

    expect(knowledgeSearchService.search).toHaveBeenCalledWith(
      'PO 订单',
      expect.objectContaining({ tenantCode: 'yurex', mode: 'hybrid' }),
    );
    expect(result).toContain('guide.md');
  });

  it('executes calculate tool', async () => {
    const result = await service.execute('calculate', {
      expression: '1+2*3',
    });

    expect(JSON.parse(result)).toMatchObject({ result: 7 });
  });

  it('returns current time', async () => {
    const result = await service.execute('get_current_time', {});

    expect(result).toContain('2026');
  });
});
