import { RagService } from './rag.service';

jest.mock('ai', () => ({
  createUIMessageStream: jest.fn((config) => config),
}));

describe('RagService (Facade)', () => {
  let mockQueryService: {
    answerQuestion: jest.Mock;
    streamAnswer: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryService = {
      answerQuestion: jest.fn().mockResolvedValue({
        sessionKey: 'conversation:conv-1:user-1',
        answer: '模型答案',
        sources: [],
        chunks: [],
      }),
      streamAnswer: jest.fn(),
    };
  });

  it('delegates answerQuestion to RagQueryService', async () => {
    const service = new RagService(mockQueryService as any);

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
    expect(mockQueryService.answerQuestion).toHaveBeenCalledWith('问题', {
      topK: 3,
      session: {
        channel: 'http',
        conversationId: 'conv-1',
        participantId: 'user-1',
      },
    });
  });

  it('delegates answerQuestion without options', async () => {
    const service = new RagService(mockQueryService as any);

    await service.answerQuestion('问题');

    expect(mockQueryService.answerQuestion).toHaveBeenCalledWith('问题', {});
  });

  it('returns error when queryService fails', async () => {
    mockQueryService.answerQuestion.mockRejectedValue(
      new Error('model failed'),
    );

    const service = new RagService(mockQueryService as any);

    await expect(service.answerQuestion('问题')).rejects.toThrow(
      'model failed',
    );
  });

  it('delegates streamAnswer to RagQueryService', async () => {
    const mockGenerator = (async function* () {
      yield { type: 'answer' as const, data: '流式答案' };
      yield { type: 'done' as const, data: { stage: 'done', message: '完成' } };
    })();

    mockQueryService.streamAnswer.mockReturnValue(mockGenerator);

    const service = new RagService(mockQueryService as any);

    const events = [];
    for await (const event of service.streamAnswer('问题')) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'answer', data: '流式答案' },
      { type: 'done', data: { stage: 'done', message: '完成' } },
    ]);
    expect(mockQueryService.streamAnswer).toHaveBeenCalledWith('问题', {});
  });

  it('adapts workflow events to the existing AGUI writer protocol', async () => {
    mockQueryService.streamAnswer.mockImplementation(async function* () {
      yield {
        type: 'status',
        data: { stage: 'retrieve_start', message: '开始检索知识库' },
      };
      yield { type: 'reasoning', data: '思考过程' };
      yield { type: 'answer', data: '模型答案' };
      yield {
        type: 'done',
        data: { stage: 'done', message: '生成完成' },
      };
    });
    const service = new RagService(mockQueryService as any);
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

    expect(mockQueryService.streamAnswer).toHaveBeenCalledWith('审批呢？', {
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
    const writtenEvents = writer.write.mock.calls.map(([event]) => event);
    const reasoningStartIndex = writtenEvents.findIndex(
      (event) => event.type === 'reasoning-start',
    );
    const reasoningDeltaIndex = writtenEvents.findIndex(
      (event) => event.type === 'reasoning-delta',
    );
    const reasoningEndIndex = writtenEvents.findIndex(
      (event) => event.type === 'reasoning-end',
    );
    const textStartIndex = writtenEvents.findIndex(
      (event) => event.type === 'text-start',
    );
    expect(reasoningStartIndex).toBeLessThan(reasoningDeltaIndex);
    expect(reasoningDeltaIndex).toBeLessThan(reasoningEndIndex);
    expect(reasoningEndIndex).toBeLessThan(textStartIndex);
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text-end' }),
    );
  });

  it('rejects AGUI requests without user question text', () => {
    const service = new RagService(mockQueryService as any);

    expect(() =>
      service.createChatStream({
        messages: [{ id: 'm1', role: 'user', parts: [] } as any],
      }),
    ).toThrow('question text is required');
  });
});
