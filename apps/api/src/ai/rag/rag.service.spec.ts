import { RagService } from './rag.service';

describe('RagService (Facade)', () => {
  let mockQueryService: {
    answerQuestion: jest.Mock;
    streamAnswer: jest.Mock;
    createChatStream: jest.Mock;
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
      createChatStream: jest.fn(),
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

  it('delegates createChatStream to RagQueryService', () => {
    mockQueryService.createChatStream.mockReturnValue(new ReadableStream({}));

    const service = new RagService(mockQueryService as any);

    service.createChatStream({
      id: 'demo-chat',
      participantId: 'alice',
      messages: [
        {
          id: 'm1',
          role: 'user',
          parts: [{ type: 'text', text: '怎么使用知识库？' }],
        } as any,
      ],
    });

    expect(mockQueryService.createChatStream).toHaveBeenCalledWith({
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
  });

  it('rejects createChatStream when queryService throws', () => {
    mockQueryService.createChatStream.mockImplementation(() => {
      throw new Error('question text is required');
    });

    const service = new RagService(mockQueryService as any);

    expect(() =>
      service.createChatStream({
        messages: [{ id: 'm1', role: 'user', parts: [] } as any],
      }),
    ).toThrow('question text is required');
  });
});
