import { ChatOpenAI } from '@langchain/openai';
import type {
  RagMemoryMessage,
  RagResolvedSession,
} from '../../types/rag.type';
import { RagQuestionRouterService } from './rag-question-router.service';

const mockModelInvoke = jest.fn();

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: mockModelInvoke,
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        queryRewriteModelName: 'qwen-turbo',
        openAiApiKey: 'test-key',
        openAiBaseUrl: 'https://openai.test',
      };
      return values[key];
    }),
  },
}));

describe('RagQuestionRouterService', () => {
  let service: RagQuestionRouterService;
  let promptRegistry: {
    buildPrompt: jest.Mock;
    formatMemory: jest.Mock;
  };
  let logger: {
    setContext: jest.Mock;
    info: jest.Mock;
  };
  let session: RagResolvedSession;
  let memory: RagMemoryMessage[];

  beforeEach(() => {
    jest.clearAllMocks();
    promptRegistry = {
      buildPrompt: jest.fn().mockResolvedValue('route prompt'),
      formatMemory: jest.fn().mockReturnValue('formatted memory'),
    };
    logger = {
      setContext: jest.fn(),
      info: jest.fn(),
    };
    service = new RagQuestionRouterService(
      logger as any,
      { tenant: 'aplus' } as any,
      promptRegistry as any,
    );
    session = {
      channel: 'http',
      tenantCode: 'aplus',
      sessionKey: 'conversation:conv-1:user-1',
      encodedSessionKey: 'encoded',
      conversationId: 'conv-1',
      participantId: 'user-1',
    };
    memory = [
      {
        role: 'user',
        content: 'FBA 库存怎么处理？',
        createdAt: '2026-08-04T00:00:00.000Z',
      },
    ];
  });

  it('uses qwen-turbo without reasoning parameters', () => {
    expect(ChatOpenAI).toHaveBeenCalledWith({
      temperature: 0,
      model: 'qwen-turbo',
      apiKey: 'test-key',
      configuration: { baseURL: 'https://openai.test' },
    });
    expect(ChatOpenAI).toHaveBeenCalledWith(
      expect.not.objectContaining({ modelKwargs: expect.anything() }),
    );
  });

  it.each([
    ['亚马逊 Listing 怎么优化？', 'rag'],
    ['你好', 'direct'],
    ['？？？', 'direct'],
    ['量子力学是什么？', 'direct'],
    ['这个怎么处理？', 'rag'],
  ] as const)('returns the parsed route for %s', async (question, route) => {
    mockModelInvoke.mockResolvedValue({
      content: JSON.stringify({ route, routeReason: '分类依据' }),
    });

    const result = await service.route({ question, memory, session, topK: 5 });

    expect(result).toMatchObject({
      route,
      status: 'success',
      routeReason: '分类依据',
    });
    expect(promptRegistry.formatMemory).toHaveBeenCalledWith(memory);
    expect(promptRegistry.buildPrompt).toHaveBeenCalledWith('route', {
      question,
      memory: 'formatted memory',
      formatInstructions: expect.any(String),
    });
  });

  it.each([
    ['empty response', { content: '' }],
    ['invalid route', { content: '{"route":"other","routeReason":"x"}' }],
    ['invalid structure', { content: '{"route":"direct"}' }],
    ['empty reason', { content: '{"route":"direct","routeReason":""}' }],
  ])('falls back to RAG for %s', async (_name, response) => {
    mockModelInvoke.mockResolvedValue(response);

    const result = await service.route({
      question: '这个呢？',
      memory,
      session,
    });

    expect(result).toMatchObject({
      route: 'rag',
      status: 'failed',
      fallbackReason: expect.any(String),
    });
  });

  it('falls back to RAG when the model times out and logs no content', async () => {
    mockModelInvoke.mockRejectedValue(new Error('request timeout'));

    const result = await service.route({
      question: '敏感问题正文',
      memory,
      session,
    });

    expect(result).toMatchObject({
      route: 'rag',
      status: 'failed',
      fallbackReason: 'Error',
    });
    const logMeta = logger.info.mock.calls[0][2];
    expect(logMeta).toMatchObject({
      route: 'rag',
      routeStatus: 'failed',
      fallback: true,
      errorType: 'Error',
    });
    expect(JSON.stringify(logMeta)).not.toContain('敏感问题正文');
    expect(JSON.stringify(logMeta)).not.toContain('request timeout');
    expect(logMeta).not.toHaveProperty('routeReason');
  });
});
