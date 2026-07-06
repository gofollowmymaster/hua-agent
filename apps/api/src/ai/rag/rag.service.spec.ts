jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedQuery: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  })),
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({ content: '模型答案' }),
    stream: jest.fn().mockResolvedValue(
      (async function* () {
        yield { content: '流式' };
        yield { content: '答案' };
      })(),
    ),
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const config = {
        vcHelper: { defaultTopK: 5 },
        embeddingsApiKey: 'embedding-key',
        embeddingsModelName: 'embedding-model',
        embeddingsDimensions: 1024,
        embeddingsBaseUrl: 'https://embedding.example.com',
        modelName: 'chat-model',
        openAiApiKey: 'chat-key',
        openAiBaseUrl: 'https://chat.example.com',
      };
      return config[key];
    }),
  },
}));

const { RagService } = require('./rag.service');

describe('RagService', () => {
  let ragPrisma: { $queryRaw: jest.Mock };
  let logger: { setContext: jest.Mock; warn: jest.Mock };
  let tenantContext: { tenant: string };
  let ragMemoryService: {
    resolveSession: jest.Mock;
    loadShortTermMemory: jest.Mock;
    appendTurn: jest.Mock;
    formatMemory: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ragPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: BigInt(1),
          tenant_code: 'aplus',
          document_id: BigInt(2),
          chunk_index: 0,
          content: '资料内容',
          metadata: {},
          file_name: 'doc.md',
          source_path: 'doc.md',
          similarity: 0.9,
        },
      ]),
    };
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
    };
    tenantContext = { tenant: 'aplus' };
    ragMemoryService = {
      resolveSession: jest.fn().mockReturnValue({
        tenantCode: 'aplus',
        channel: 'http',
        sessionKey: 'conversation:conv-1:user-1',
        encodedSessionKey: 'encoded',
      }),
      loadShortTermMemory: jest.fn().mockResolvedValue([
        {
          role: 'user',
          content: '上一问',
          createdAt: '2026-07-03T00:00:00.000Z',
        },
      ]),
      appendTurn: jest.fn().mockResolvedValue(undefined),
      formatMemory: jest.fn().mockReturnValue('[1] 用户：上一问'),
    };
  });

  it('answers with memory and returns sessionKey', async () => {
    const service = new RagService(
      ragPrisma as any,
      logger as any,
      tenantContext as any,
      ragMemoryService as any,
    );

    const result = await service.answerQuestion('问题', {
      topK: 3,
      session: {
        channel: 'http',
        conversationId: 'conv-1',
        participantId: 'user-1',
      },
    });

    expect(result).toMatchObject({
      sessionKey: 'conversation:conv-1:user-1',
      answer: '模型答案',
    });
    expect(ragMemoryService.loadShortTermMemory).toHaveBeenCalled();
    expect(ragMemoryService.formatMemory).toHaveBeenCalled();
    expect(ragMemoryService.appendTurn).toHaveBeenCalledWith(
      expect.objectContaining({ sessionKey: 'conversation:conv-1:user-1' }),
      '问题',
      '模型答案',
    );
  });

  it('keeps old call shape usable without options', async () => {
    const service = new RagService(
      ragPrisma as any,
      logger as any,
      tenantContext as any,
      ragMemoryService as any,
    );

    await service.answerQuestion('问题');

    expect(ragMemoryService.resolveSession).toHaveBeenCalledWith({});
  });

  it('falls back to invoke when stream generation fails', async () => {
    const service = new RagService(
      ragPrisma as any,
      logger as any,
      tenantContext as any,
      ragMemoryService as any,
    );
    (service as any).model.stream = jest.fn().mockRejectedValue(new Error('failed'));

    const events = [];
    for await (const event of service.streamAnswer('问题')) {
      events.push(event);
    }

    expect(logger.warn).toHaveBeenCalledWith(
      'RAG stream failed, fallback to invoke',
      undefined,
      expect.objectContaining({
        stage: 'rag_stream_failed_fallback',
        error: 'failed',
      }),
    );
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'status',
          data: expect.objectContaining({ stage: 'fallback_start' }),
        }),
        { type: 'answer', data: '模型答案' },
        expect.objectContaining({
          type: 'done',
        }),
      ]),
    );
    expect(ragMemoryService.appendTurn).toHaveBeenCalledWith(
      expect.any(Object),
      '问题',
      '模型答案',
    );
  });

  it('streams AGUI chat chunks from latest user text', async () => {
    const service = new RagService(
      ragPrisma as any,
      logger as any,
      tenantContext as any,
      ragMemoryService as any,
    );

    const stream = service.createChatStream({
      id: 'demo-chat',
      participantId: 'alice',
      messages: [
        {
          id: 'm1',
          role: 'user',
          parts: [{ type: 'text', text: '怎么使用知识库？' }],
        },
      ],
    });

    const chunks = await readStream(stream);

    expect(ragMemoryService.resolveSession).toHaveBeenCalledWith({
      session: expect.objectContaining({
        channel: 'web',
        conversationId: 'demo-chat',
        conversationType: 'rag-chat',
        participantId: 'alice',
      }),
    });
    expect(chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'text-delta', delta: '流式' }),
        expect.objectContaining({ type: 'text-delta', delta: '答案' }),
        expect.objectContaining({
          type: 'data-status',
          data: expect.objectContaining({ stage: 'retrieve_start' }),
        }),
        expect.objectContaining({
          type: 'data-status',
          data: expect.objectContaining({ stage: 'done' }),
        }),
      ]),
    );
  });

  it('rejects AGUI chat without user text before retrieval', () => {
    const service = new RagService(
      ragPrisma as any,
      logger as any,
      tenantContext as any,
      ragMemoryService as any,
    );

    expect(() =>
      service.createChatStream({
        messages: [{ id: 'm1', role: 'user', parts: [] }],
      }),
    ).toThrow('question text is required');
    expect(ragPrisma.$queryRaw).not.toHaveBeenCalled();
  });
});

async function readStream(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks: unknown[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return chunks;
}
