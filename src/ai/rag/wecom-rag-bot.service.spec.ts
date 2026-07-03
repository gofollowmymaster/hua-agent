const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockReplyStreamNonBlocking = jest.fn();
const mockReplyWelcome = jest.fn();
let mockWecomRagBotConfigs: any[] = [];
let mockRagConfig: any = {};

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

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'vcHelper') return mockRagConfig;
      if (key === 'tenantConfig') return buildTenantConfig();
      return undefined;
    }),
  },
}));

describe('WecomRagBotService', () => {
  let ragService: { streamAnswer: jest.Mock };
  let tenantContext: { run: jest.Mock };
  let logger: {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    debug: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWecomRagBotConfigs = [
      {
        tenantCode: 'aplus',
        enabled: true,
        botId: 'bot-id',
        secret: 'secret',
      },
      {
        tenantCode: 'boat',
        enabled: false,
        botId: '',
        secret: '',
      },
      {
        tenantCode: 'yurex',
        enabled: false,
        botId: '',
        secret: '',
      },
    ];
    mockRagConfig = { defaultTopK: 5 };

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
    tenantContext = {
      run: jest.fn((_context, callback) => callback()),
    };
  });

  it('does not connect when disabled', () => {
    mockWecomRagBotConfigs[0].enabled = false;
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );

    service.onModuleInit();

    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('registers handlers and connects when enabled', () => {
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );

    service.onModuleInit();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith('message.text', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith(
      'event.enter_chat',
      expect.any(Function),
    );
  });

  it('streams rag answer for text messages', async () => {
    mockRagConfig.defaultTopK = 8;
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );
    service.onModuleInit();
    const handler = getHandler('message.text');

    await handler(buildTextFrame('什么是 VC？'));

    expect(tenantContext.run).toHaveBeenCalledWith(
      { tenantCode: 'aplus' },
      expect.any(Function),
    );
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
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );
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
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );
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
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );
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

  it('creates one websocket client per enabled tenant', () => {
    mockWecomRagBotConfigs[1] = {
      tenantCode: 'boat',
      enabled: true,
      botId: 'boat-bot-id',
      secret: 'boat-secret',
    };
    const WecomRagBotService = getWecomRagBotService();
    const service = new WecomRagBotService(
      ragService as any,
      logger as any,
      tenantContext as any,
    );

    service.onModuleInit();

    expect(mockConnect).toHaveBeenCalledTimes(2);
  });
});

function getWecomRagBotService() {
  return require('./wecom-rag-bot.service').WecomRagBotService;
}

function buildTenantConfig() {
  return mockWecomRagBotConfigs.reduce((config, item) => {
    config[item.tenantCode] = {
      wecomBot: {
        vcHelperClient: {
          enabled: item.enabled,
          botId: item.botId,
          secret: item.secret,
          wsUrl: item.wsUrl,
        },
      },
    };
    return config;
  }, {});
}

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
