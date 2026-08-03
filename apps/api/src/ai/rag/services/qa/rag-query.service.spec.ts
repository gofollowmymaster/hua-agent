import { RagQueryService } from './rag-query.service';
import type { RagResolvedSession, RetrievedChunk } from '../../types/rag.type';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: jest.fn(),
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        vcHelper: { defaultTopK: 8 },
        embeddingsApiKey: 'embedding-key',
        embeddingsModelName: 'text-embedding-v3',
        embeddingsDimensions: 1024,
        embeddingsBaseUrl: 'https://embedding.test',
        modelName: 'qwen-plus',
        openAiApiKey: 'test-key',
        openAiBaseUrl: 'https://openai.test',
      };
      return values[key];
    }),
  },
}));

describe('RagQueryService', () => {
  let ragMemoryService: {
    resolveSession: jest.Mock;
    loadShortTermMemory: jest.Mock;
    appendUserMessage: jest.Mock;
    appendAssistantMessage: jest.Mock;
  };
  let promptRegistry: {
    buildPrompt: jest.Mock;
    formatMemory: jest.Mock;
    formatLocation: jest.Mock;
  };
  let queryRewriteService: { rewrite: jest.Mock };
  let ragRetrievalService: { retrieve: jest.Mock };
  let service: RagQueryService;
  let session: RagResolvedSession;
  let chunks: RetrievedChunk[];

  beforeEach(() => {
    jest.clearAllMocks();

    session = {
      channel: 'http',
      tenantCode: 'aplus',
      sessionKey: 'conversation:conv-1:user-1',
      encodedSessionKey: 'encoded',
    };
    chunks = [
      {
        id: 'chunk-1',
        tenantCode: 'aplus',
        documentId: 'doc-1',
        fileName: '制度.pdf',
        fileType: 'pdf',
        sourcePath: 'raw/制度.pdf',
        chunkIndex: 0,
        content: '报销审批需要主管确认。',
        metadata: { page: 2 },
        similarity: 0.91,
      },
    ];
    ragMemoryService = {
      resolveSession: jest.fn().mockReturnValue(session),
      loadShortTermMemory: jest.fn().mockResolvedValue([
        {
          role: 'user',
          content: '报销怎么走？',
          createdAt: '2026-07-31T00:00:00.000Z',
        },
      ]),
      appendUserMessage: jest.fn().mockResolvedValue(undefined),
      appendAssistantMessage: jest.fn().mockResolvedValue(undefined),
    };
    promptRegistry = {
      buildPrompt: jest.fn().mockResolvedValue('qa prompt'),
      formatMemory: jest.fn().mockReturnValue('formatted memory'),
      formatLocation: jest.fn().mockReturnValue('第 2 页'),
    };
    queryRewriteService = {
      rewrite: jest.fn().mockResolvedValue({
        originalQuestion: '审批呢？',
        rewrittenQuestion: '报销审批流程',
        usedRewrite: true,
      }),
    };
    ragRetrievalService = {
      retrieve: jest.fn().mockResolvedValue(chunks),
    };

    service = new RagQueryService(
      {} as any,
      { setContext: jest.fn() } as any,
      { tenant: 'aplus' } as any,
      ragMemoryService as any,
      promptRegistry as any,
      queryRewriteService as any,
      ragRetrievalService as any,
    );
    (service as any).model = {
      invoke: jest.fn().mockResolvedValue({ content: '模型答案' }),
    };
  });

  it('retrieves with rewritten question and answers with original question', async () => {
    const result = await service.answerQuestion('审批呢？', {
      topK: 3,
      session: { channel: 'http', conversationId: 'conv-1' },
    });

    expect(queryRewriteService.rewrite).toHaveBeenCalledWith({
      question: '审批呢？',
      memory: [
        {
          role: 'user',
          content: '报销怎么走？',
          createdAt: '2026-07-31T00:00:00.000Z',
        },
      ],
      session,
      topK: 3,
    });
    expect(ragRetrievalService.retrieve).toHaveBeenCalledWith({
      query: '报销审批流程',
      originalQuestion: '审批呢？',
      topK: 3,
      sessionKey: 'conversation:conv-1:user-1',
    });
    expect(promptRegistry.buildPrompt).toHaveBeenCalledWith('qa', {
      question: '审批呢？',
      chunks,
      memory: 'formatted memory',
    });
    expect(ragMemoryService.appendUserMessage).toHaveBeenCalledWith(
      session,
      '审批呢？',
    );
    expect(ragMemoryService.appendAssistantMessage).toHaveBeenCalledWith(
      session,
      '模型答案',
    );
    expect(result).toMatchObject({
      sessionKey: 'conversation:conv-1:user-1',
      answer: '模型答案',
      chunks,
    });
  });
});
