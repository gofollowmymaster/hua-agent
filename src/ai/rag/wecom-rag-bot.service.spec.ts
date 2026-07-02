const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockReplyStreamNonBlocking = jest.fn();
const mockReplyWelcome = jest.fn();

jest.mock('@wecom/aibot-node-sdk', () => ({
  MessageType: { Text: 'text' },
  generateReqId: jest.fn((prefix: string) => `${prefix}_id`),
  WSClient: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    on: mockOn,
    replyStreamNonBlocking: mockReplyStreamNonBlocking,
    replyWelcome: mockReplyWelcome,
  })),
}));

const { WecomRagBotService } = require('./wecom-rag-bot.service');

describe('WecomRagBotService', () => {
  let ragService: { streamAnswer: jest.Mock };
  let logger: {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    debug: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WECOM_RAG_BOT_ENABLED = 'true';
    process.env.WECOM_RAG_BOT_ID = 'bot-id';
    process.env.WECOM_RAG_BOT_SECRET = 'secret';
    delete process.env.WECOM_RAG_BOT_WS_URL;
    delete process.env.WECOM_RAG_DEFAULT_TOP_K;

    ragService = {
      streamAnswer: jest.fn(async function* () {
        yield {
          type: 'status',
          data: { stage: 'retrieve_start', message: '开始检索知识库' },
        };
        yield { type: 'answer', data: '回答' };
        yield { type: 'answer', data: '内容' };
        yield { type: 'done', data: { stage: 'done', message: '生成完成' } };
      }),
    };
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('does not connect when disabled', () => {
    process.env.WECOM_RAG_BOT_ENABLED = 'false';
    const service = new WecomRagBotService(ragService as any, logger as any);

    service.onModuleInit();

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('registers handlers and connects when enabled', () => {
    const service = new WecomRagBotService(ragService as any, logger as any);

    service.onModuleInit();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith('message.text', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith(
      'event.enter_chat',
      expect.any(Function),
    );
  });

  it('streams rag answer for text messages', async () => {
    process.env.WECOM_RAG_DEFAULT_TOP_K = '8';
    const service = new WecomRagBotService(ragService as any, logger as any);
    service.onModuleInit();
    const handler = getHandler('message.text');

    await handler(buildTextFrame('什么是 VC？'));

    expect(ragService.streamAnswer).toHaveBeenCalledWith('什么是 VC？', 8);
    expect(mockReplyStreamNonBlocking).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      'rag_stream_id',
      '正在检索知识库，请稍候...\n\n',
      false,
    );
    expect(mockReplyStreamNonBlocking).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      'rag_stream_id',
      '回答',
      false,
    );
    expect(mockReplyStreamNonBlocking).toHaveBeenNthCalledWith(
      3,
      expect.any(Object),
      'rag_stream_id',
      '回答内容',
      false,
    );
    expect(mockReplyStreamNonBlocking).toHaveBeenLastCalledWith(
      expect.any(Object),
      'rag_stream_id',
      '回答内容\n\n---\n来源：企业知识库检索结果。',
      true,
    );
  });

  it('replies tip for empty text messages', async () => {
    const service = new WecomRagBotService(ragService as any, logger as any);
    service.onModuleInit();
    const handler = getHandler('message.text');

    await handler(buildTextFrame('   '));

    expect(ragService.streamAnswer).not.toHaveBeenCalled();
    expect(mockReplyStreamNonBlocking).toHaveBeenCalledWith(
      expect.any(Object),
      'rag_stream_id',
      '请发送需要查询的文本问题。',
      true,
    );
  });

  it('replies unsupported tip for non-text messages', async () => {
    const service = new WecomRagBotService(ragService as any, logger as any);
    service.onModuleInit();
    const handler = getHandler('message');

    await handler(buildBaseFrame('image'));

    expect(mockReplyStreamNonBlocking).toHaveBeenCalledWith(
      expect.any(Object),
      'rag_stream_id',
      '不支持该消息类型，请发送文本问题。',
      true,
    );
  });

  it('replies fallback when rag throws', async () => {
    ragService.streamAnswer = jest.fn(async function* () {
      throw new Error('rag failed');
    });
    const service = new WecomRagBotService(ragService as any, logger as any);
    service.onModuleInit();
    const handler = getHandler('message.text');

    await handler(buildTextFrame('问题'));

    expect(mockReplyStreamNonBlocking).toHaveBeenLastCalledWith(
      expect.any(Object),
      'rag_stream_id',
      '知识库问答暂时不可用，请稍后重试。',
      true,
    );
  });
});

function getHandler(eventName: string) {
  const call = mockOn.mock.calls.find(([name]) => name === eventName);
  return call?.[1] as (frame: any) => Promise<void>;
}

function buildTextFrame(content: string) {
  return {
    headers: { req_id: 'req-id' },
    body: {
      msgid: 'msg-id',
      msgtype: 'text',
      chattype: 'single',
      from: { userid: 'user-id' },
      text: { content },
    },
  };
}

function buildBaseFrame(msgtype: string) {
  return {
    headers: { req_id: 'req-id' },
    body: {
      msgid: 'msg-id',
      msgtype,
      chattype: 'single',
      from: { userid: 'user-id' },
    },
  };
}
