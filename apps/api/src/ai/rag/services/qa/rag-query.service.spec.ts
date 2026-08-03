import { RagQueryService } from './rag-query.service';
import type {
  RagResolvedSession,
  RetrievalCandidate,
  RetrievedChunk,
} from '../../types/rag.type';
import type { RagRetrievalRouteResult } from './rag-workflow.type';

const mockModelInvoke = jest.fn();
const mockModelStream = jest.fn();

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: mockModelInvoke,
    stream: mockModelStream,
  })),
  OpenAIEmbeddings: jest.fn(),
}));

jest.mock('ai', () => ({
  createUIMessageStream: jest.fn((config) => config),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        vcHelper: { defaultTopK: 8 },
        modelName: 'qwen-plus',
        openAiApiKey: 'test-key',
        openAiBaseUrl: 'https://openai.test',
      };
      return values[key];
    }),
  },
}));

describe('RagQueryService', () => {
  let session: RagResolvedSession;
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
  let ragRetrievalService: {
    retrieveVector: jest.Mock;
    retrieveKeyword: jest.Mock;
    fuseCandidates: jest.Mock;
    rerankCandidates: jest.Mock;
  };
  let logger: {
    setContext: jest.Mock;
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
  };
  let service: RagQueryService;
  let vectorCandidate: RetrievalCandidate;
  let keywordCandidate: RetrievalCandidate;
  let chunks: RetrievedChunk[];

  beforeEach(() => {
    jest.clearAllMocks();
    session = {
      channel: 'http',
      tenantCode: 'aplus',
      sessionKey: 'conversation:conv-1:user-1',
      encodedSessionKey: 'encoded',
      conversationId: 'conv-1',
      participantId: 'user-1',
    };
    vectorCandidate = buildCandidate('vector', 'chunk-1', 0.91);
    keywordCandidate = buildCandidate('keyword', 'chunk-2', 0.72);
    chunks = [vectorCandidate, keywordCandidate];
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
        rewrittenQuestion: '审批呢？',
        usedRewrite: false,
        rewriteReason: '查询改写模型调用失败，回退原问题',
        fallbackReason: 'test',
      }),
    };
    ragRetrievalService = {
      retrieveVector: jest
        .fn()
        .mockResolvedValue(buildRouteResult('vector', [vectorCandidate])),
      retrieveKeyword: jest
        .fn()
        .mockResolvedValue(buildRouteResult('keyword', [keywordCandidate])),
      fuseCandidates: jest
        .fn()
        .mockReturnValue([vectorCandidate, keywordCandidate]),
      rerankCandidates: jest.fn().mockResolvedValue({
        status: 'success',
        chunks,
        durationMs: 2,
      }),
    };
    logger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    service = new RagQueryService(
      logger as any,
      { tenant: 'aplus' } as any,
      ragMemoryService as any,
      promptRegistry as any,
      queryRewriteService as any,
      ragRetrievalService as any,
    );
  });

  it('runs vector and keyword retrieval in parallel before fusion', async () => {
    let resolveVector: (value: RagRetrievalRouteResult) => void;
    let resolveKeyword: (value: RagRetrievalRouteResult) => void;
    ragRetrievalService.retrieveVector.mockReturnValue(
      new Promise((resolve) => {
        resolveVector = resolve;
      }),
    );
    ragRetrievalService.retrieveKeyword.mockReturnValue(
      new Promise((resolve) => {
        resolveKeyword = resolve;
      }),
    );
    mockModelInvoke.mockResolvedValue({ content: '模型答案' });
    const graphInvokeSpy = jest.spyOn((service as any).graph, 'invoke');

    const resultPromise = service.answerQuestion('审批呢？', {
      topK: 2,
      session: {
        channel: 'http',
        conversationId: 'conv-1',
        participantId: 'user-1',
      },
    });
    await waitForCalls(
      ragRetrievalService.retrieveVector,
      ragRetrievalService.retrieveKeyword,
    );

    expect(ragRetrievalService.retrieveVector).toHaveBeenCalledTimes(1);
    expect(ragRetrievalService.retrieveKeyword).toHaveBeenCalledTimes(1);
    expect(ragRetrievalService.fuseCandidates).not.toHaveBeenCalled();

    resolveVector(buildRouteResult('vector', [vectorCandidate]));
    await new Promise((resolve) => setImmediate(resolve));
    expect(ragRetrievalService.fuseCandidates).not.toHaveBeenCalled();

    resolveKeyword(buildRouteResult('keyword', [keywordCandidate]));
    const result = await resultPromise;

    expect(ragRetrievalService.fuseCandidates).toHaveBeenCalledWith([
      [vectorCandidate],
      [keywordCandidate],
    ]);
    expect(queryRewriteService.rewrite).toHaveBeenCalledWith({
      question: '审批呢？',
      memory: expect.any(Array),
      session,
      topK: 2,
    });
    expect(promptRegistry.buildPrompt).toHaveBeenCalledWith('qa', {
      question: '审批呢？',
      chunks,
      memory: 'formatted memory',
    });
    expect(
      ragMemoryService.appendUserMessage.mock.invocationCallOrder[0],
    ).toBeLessThan(
      ragRetrievalService.retrieveVector.mock.invocationCallOrder[0],
    );
    expect(ragMemoryService.appendAssistantMessage).toHaveBeenCalledWith(
      session,
      '模型答案',
    );
    expect(result).toMatchObject({
      sessionKey: session.sessionKey,
      answer: '模型答案',
      chunks,
    });
    expect(graphInvokeSpy.mock.calls[0][1]).toMatchObject({
      runName: 'rag_qa_workflow',
      tags: ['rag', 'sync'],
      metadata: {
        tenantCode: 'aplus',
        sessionKey: session.sessionKey,
        channel: 'http',
        topK: 2,
      },
    });
  });

  it('streams the existing status sequence and answer tokens', async () => {
    mockModelStream.mockResolvedValue(
      (async function* () {
        yield { content: '模型' };
        yield { content: '答案' };
      })(),
    );

    const events = [];
    for await (const event of service.streamAnswer('审批呢？', { topK: 2 })) {
      events.push(event);
    }

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

  it('falls back to invoke when the model stream is empty', async () => {
    mockModelStream.mockResolvedValue(
      (async function* () {
        yield { content: '' };
      })(),
    );
    mockModelInvoke.mockResolvedValue({ content: '普通生成答案' });

    const events = [];
    for await (const event of service.streamAnswer('审批呢？', { topK: 2 })) {
      events.push(event);
    }

    expect(events).toContainEqual({
      type: 'status',
      data: expect.objectContaining({ stage: 'fallback_start' }),
    });
    expect(events).toContainEqual({
      type: 'answer',
      data: '普通生成答案',
    });
    expect(ragMemoryService.appendAssistantMessage).toHaveBeenCalledWith(
      session,
      '普通生成答案',
    );
  });

  it('maps workflow events to the existing AGUI writer protocol', async () => {
    jest.spyOn(service, 'streamAnswer').mockImplementation(async function* () {
      yield {
        type: 'status',
        data: { stage: 'retrieve_start', message: '开始检索知识库' },
      };
      yield { type: 'answer', data: '模型答案' };
      yield {
        type: 'done',
        data: { stage: 'done', message: '生成完成' },
      };
    });
    const stream = service.createChatStream({
      id: 'conversation-1',
      participantId: 'user-1',
      messages: [
        {
          id: 'message-1',
          role: 'user',
          parts: [{ type: 'text', text: '审批呢？' }],
        } as any,
      ],
    }) as any;
    const writer = { write: jest.fn() };

    await stream.execute({ writer });

    expect(service.streamAnswer).toHaveBeenCalledWith('审批呢？', {
      session: {
        channel: 'web',
        conversationId: 'conversation-1',
        conversationType: 'rag-chat',
        participantId: 'user-1',
        messageId: 'message-1',
        metadata: { source: 'rag-chat' },
      },
    });
    expect(writer.write).toHaveBeenCalledWith({
      type: 'data-status',
      data: { stage: 'retrieve_start', message: '开始检索知识库' },
    });
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text-delta', delta: '模型答案' }),
    );
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text-end' }),
    );
  });

  it('rejects AGUI requests without user question text', () => {
    expect(() =>
      service.createChatStream({
        messages: [{ id: 'message-1', role: 'user', parts: [] } as any],
      }),
    ).toThrow('question text is required');
  });
});

function buildCandidate(
  route: 'vector' | 'keyword',
  id: string,
  score: number,
): RetrievalCandidate {
  return {
    id,
    tenantCode: 'aplus',
    documentId: 'doc-1',
    fileName: '制度.pdf',
    fileType: 'pdf',
    sourcePath: 'raw/制度.pdf',
    chunkIndex: 0,
    content: '报销审批需要主管确认。',
    metadata: { page: 2 },
    similarity: route === 'vector' ? score : 0,
    score,
    retrieval: {
      routes: [route],
      vectorRank: route === 'vector' ? 1 : undefined,
      keywordRank: route === 'keyword' ? 1 : undefined,
      vectorScore: route === 'vector' ? score : undefined,
      keywordScore: route === 'keyword' ? score : undefined,
    },
  };
}

function buildRouteResult(
  route: 'vector' | 'keyword',
  candidates: RetrievalCandidate[],
): RagRetrievalRouteResult {
  return { route, status: 'success', candidates, durationMs: 1 };
}

async function waitForCalls(...mocks: jest.Mock[]) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (mocks.every((mock) => mock.mock.calls.length > 0)) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error('Timed out waiting for retrieval nodes');
}
