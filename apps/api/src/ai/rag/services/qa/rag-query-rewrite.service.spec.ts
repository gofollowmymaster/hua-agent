import { RagQueryRewriteService } from './rag-query-rewrite.service';
import { ChatOpenAI } from '@langchain/openai';
import type {
  RagMemoryMessage,
  RagResolvedSession,
} from '../../types/rag.type';

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
        modelName: 'qwen-plus',
        queryRewriteModelName: 'qwen-turbo',
        openAiApiKey: 'test-key',
        openAiBaseUrl: 'https://openai.test',
      };
      return values[key];
    }),
  },
}));

describe('RagQueryRewriteService', () => {
  let promptRegistry: {
    buildPrompt: jest.Mock;
    formatMemory: jest.Mock;
  };
  let tenantContext: { tenant?: string };
  let logger: {
    setContext: jest.Mock;
    info: jest.Mock;
  };
  let service: RagQueryRewriteService;
  let session: RagResolvedSession;
  let memory: RagMemoryMessage[];

  beforeEach(() => {
    jest.clearAllMocks();

    promptRegistry = {
      buildPrompt: jest.fn().mockResolvedValue('rewrite prompt'),
      formatMemory: jest.fn().mockReturnValue('formatted memory'),
    };
    tenantContext = { tenant: 'aplus' };
    logger = {
      setContext: jest.fn(),
      info: jest.fn(),
    };
    service = new RagQueryRewriteService(
      logger as any,
      tenantContext as any,
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
        content: '费用报销怎么审批？',
        createdAt: '2026-07-31T00:00:00.000Z',
      },
      {
        role: 'assistant',
        content: '资料里提到需要主管审批。',
        createdAt: '2026-07-31T00:00:01.000Z',
      },
    ];
  });

  it('uses the dedicated model and returns the parsed rewrite', async () => {
    mockModelInvoke.mockResolvedValue({
      content: JSON.stringify({
        rewrittenQuestion: '费用报销审批流程',
        rewriteReason: '补全连续追问中的费用报销对象',
      }),
    });

    const result = await service.rewrite({
      question: '审批呢？',
      memory,
      session,
      topK: 5,
    });

    expect(result).toEqual({
      originalQuestion: '审批呢？',
      rewrittenQuestion: '费用报销审批流程',
      usedRewrite: true,
      rewriteReason: '补全连续追问中的费用报销对象',
    });
    expect(ChatOpenAI).toHaveBeenCalledWith({
      temperature: 0,
      model: 'qwen-turbo',
      apiKey: 'test-key',
      configuration: { baseURL: 'https://openai.test' },
    });
    expect(promptRegistry.formatMemory).toHaveBeenCalledWith(memory);
    expect(promptRegistry.buildPrompt).toHaveBeenCalledWith('rewrite', {
      question: '审批呢？',
      memory: 'formatted memory',
      formatInstructions: expect.any(String),
    });
    expect(mockModelInvoke).toHaveBeenCalledWith('rewrite prompt');
    expect(logger.info).toHaveBeenCalledWith(
      'RAG query rewrite completed',
      undefined,
      expect.objectContaining({
        tenantCode: 'aplus',
        sessionKey: 'conversation:conv-1:user-1',
        usedRewrite: true,
      }),
    );
    const logMeta = logger.info.mock.calls[0][2];
    expect(logMeta).not.toHaveProperty('originalQuestion');
    expect(logMeta).not.toHaveProperty('rewrittenQuestion');
  });

  it('falls back to the normalized original question when the model fails', async () => {
    mockModelInvoke.mockRejectedValue(new Error('model unavailable'));

    const result = await service.rewrite({
      question: '  这个呢？  ',
      memory,
      session,
    });

    expect(result).toEqual({
      originalQuestion: '这个呢？',
      rewrittenQuestion: '这个呢？',
      usedRewrite: false,
      rewriteReason: '查询改写模型调用失败，回退原问题',
      fallbackReason: 'model unavailable',
    });
  });
});
