import { RagStreamService } from './rag-stream.service';
import type { RagResolvedSession, RetrievedChunk } from '../../types/rag.type';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
    stream: jest.fn(),
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

describe('RagStreamService', () => {
  let ragMemoryService: {
    resolveSession: jest.Mock;
    loadShortTermMemory: jest.Mock;
    appendUserMessage: jest.Mock;
    appendAssistantMessage: jest.Mock;
  };
  let promptRegistry: {
    buildPrompt: jest.Mock;
    formatMemory: jest.Mock;
  };
  let queryRewriteService: { rewrite: jest.Mock };
  let logger: { setContext: jest.Mock; warn: jest.Mock };
  let service: RagStreamService;
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
        metadata: {},
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
    };
    queryRewriteService = {
      rewrite: jest.fn().mockResolvedValue({
        originalQuestion: '审批呢？',
        rewrittenQuestion: '报销审批流程',
        usedRewrite: true,
      }),
    };
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
    };
    service = new RagStreamService(
      {} as any,
      logger as any,
      { tenant: 'aplus' } as any,
      ragMemoryService as any,
      promptRegistry as any,
      queryRewriteService as any,
    );
    (service as any).retrieve = jest.fn().mockResolvedValue(chunks);
  });

  it('retrieves with rewritten question and streams answer with original prompt question', async () => {
    (service as any).model = {
      stream: jest.fn().mockResolvedValue(
        (async function* () {
          yield { content: '模型' };
          yield { content: '答案' };
        })(),
      ),
      invoke: jest.fn(),
    };

    const events = [];
    for await (const event of service.streamAnswer('审批呢？', { topK: 3 })) {
      events.push(event);
    }

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
    expect((service as any).retrieve).toHaveBeenCalledWith('报销审批流程', 3);
    expect(promptRegistry.buildPrompt).toHaveBeenCalledWith('qa', {
      question: '审批呢？',
      chunks,
      memory: 'formatted memory',
    });
    expect(
      events
        .filter((event) => event.type === 'status')
        .map((event) => event.data.stage),
    ).toEqual([
      'analyzing_start',
      'retrieve_start',
      'retrieve_done',
      'generate_start',
    ]);
    expect(events).toEqual(
      expect.arrayContaining([
        { type: 'answer', data: '模型' },
        { type: 'answer', data: '答案' },
        { type: 'done', data: { stage: 'done', message: '生成完成' } },
      ]),
    );
    expect(ragMemoryService.appendAssistantMessage).toHaveBeenCalledWith(
      session,
      '模型答案',
    );
  });

  it('falls back to invoke when stream returns no text after rewritten retrieval', async () => {
    (service as any).model = {
      stream: jest.fn().mockResolvedValue(
        (async function* () {
          yield { content: '' };
        })(),
      ),
      invoke: jest.fn().mockResolvedValue({ content: '普通生成答案' }),
    };

    const events = [];
    for await (const event of service.streamAnswer('审批呢？', { topK: 3 })) {
      events.push(event);
    }

    expect((service as any).retrieve).toHaveBeenCalledWith('报销审批流程', 3);
    expect(events).toContainEqual({
      type: 'answer',
      data: '普通生成答案',
    });
    expect(ragMemoryService.appendAssistantMessage).toHaveBeenCalledWith(
      session,
      '普通生成答案',
    );
  });
});
