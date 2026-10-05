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
  };
  let tenantContext: { tenant?: string };
  let dsOrderToolService: { getTools: jest.Mock };
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
    };
    tenantContext = { tenant: 'yurex' };
    dsOrderToolService = {
      getTools: jest
        .fn()
        .mockReturnValue(
          [
            'list_ds_orders',
            'get_ds_order',
            'list_ds_order_logs',
            'audit_ds_order',
            'cancel_ds_order',
          ].map((name) => ({ name })),
        ),
    };
    service = new AgentChatToolService(
      knowledgeSearchService as any,
      knowledgeService as any,
      tenantContext as any,
      dsOrderToolService as any,
    );
  });

  it('executes knowledge search tool', async () => {
    const tool = service
      .getTools()
      .find((item) => item.name === 'search_knowledge');
    expect(tool).toBeDefined();
    const result = await tool!.invoke({ query: 'PO 订单', topK: 5 });

    expect(knowledgeSearchService.search).toHaveBeenCalledWith(
      'PO 订单',
      expect.objectContaining({ tenantCode: 'yurex', mode: 'hybrid' }),
    );
    expect(result).toContain('guide.md');
  });

  it('executes calculate tool', async () => {
    const tool = service.getTools().find((item) => item.name === 'calculate');
    expect(tool).toBeDefined();
    const result = await tool!.invoke({ expression: '1+2*3' });

    expect(JSON.parse(result)).toMatchObject({ result: 7 });
  });

  it('returns current time', async () => {
    const tool = service
      .getTools()
      .find((item) => item.name === 'get_current_time');
    expect(tool).toBeDefined();
    const result = await tool!.invoke({});

    expect(result).toContain('2026');
  });

  it('returns document detail', async () => {
    const documentTool = service
      .getTools()
      .find((item) => item.name === 'get_document');

    const document = await documentTool!.invoke({ documentId: '1' });

    expect(JSON.parse(document)).toMatchObject({
      id: '1',
      fileName: 'guide.md',
    });
  });

  it('exposes only business tools', () => {
    expect(service.getTools().map((item) => item.name)).toEqual([
      'search_knowledge',
      'get_document',
      'get_current_time',
      'calculate',
      'list_ds_orders',
      'get_ds_order',
      'list_ds_order_logs',
      'audit_ds_order',
      'cancel_ds_order',
    ]);
    expect(dsOrderToolService.getTools).toHaveBeenCalledTimes(1);
  });
});
