import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WSClient, generateReqId, MessageType } from '@wecom/aibot-node-sdk';
import type { Logger as WecomLogger } from '@wecom/aibot-node-sdk';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantCode, tenantCodeMap } from '@src/config/tenant';
import type { WecomRagBotConfig } from '@src/config/interface';
import { RagService } from './rag.service';
import type {
  WecomBaseMessageFrame,
  WecomEnterChatFrame,
  WecomRagMessageContext,
  WecomTextMessageFrame,
} from './types/wecom-rag.type';

type TenantWecomRagBotConfig = WecomRagBotConfig & {
  tenantCode: TenantCode;
};

const EMPTY_QUESTION_TIP = '请发送需要查询的文本问题。';
const UNSUPPORTED_MESSAGE_TIP = '不支持该消息类型，请发送文本问题。';
const RAG_UNAVAILABLE_TIP = '知识库问答暂时不可用，请稍后重试。';
const THINKING_TIP = '正在检索知识库，请稍候...\n\n';
const WELCOME_TEXT = '您好，我是企业知识库问答助手。请直接发送文本问题。';

@Injectable()
export class WecomRagBotService implements OnModuleInit, OnModuleDestroy {
  private readonly configs: TenantWecomRagBotConfig[];
  private readonly defaultTopK: number;
  private readonly clients = new Map<string, WSClient>();

  constructor(
    private readonly ragService: RagService,
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
  ) {
    this.configs = this.getWecomRagBotConfigs();
    this.defaultTopK = NodeConfigService.get('vcHelper').defaultTopK;
  }

  onModuleInit() {
    const enabledConfigs = this.configs.filter((config) => config.enabled);
    if (enabledConfigs.length === 0) {
      this.logger.info('WeCom RAG bot is disabled for all tenants');
      return;
    }

    for (const config of enabledConfigs) {
      if (!config.botId || !config.secret) {
        this.logger.warn('WeCom RAG bot config is incomplete', undefined, {
          tenantCode: config.tenantCode,
        });
        continue;
      }

      const client = new WSClient({
        botId: config.botId,
        secret: config.secret,
        wsUrl: config.wsUrl,
        maxReconnectAttempts: -1,
        logger: this.buildWecomLogger(config),
      });

      this.bindEvents(client, config);
      this.clients.set(config.tenantCode, client);
      client.connect();
    }
  }

  onModuleDestroy() {
    for (const client of this.clients.values()) {
      client.disconnect();
    }
    this.clients.clear();
  }

  private bindEvents(client: WSClient, config: TenantWecomRagBotConfig) {
    client.on('connected', () => {
      this.logger.info('WeCom RAG bot websocket connected', undefined, {
        tenantCode: config.tenantCode,
      });
    });

    client.on('authenticated', () => {
      this.logger.info('WeCom RAG bot authenticated', undefined, {
        tenantCode: config.tenantCode,
      });
    });

    client.on('disconnected', (reason) => {
      this.logger.warn('WeCom RAG bot websocket disconnected', undefined, {
        tenantCode: config.tenantCode,
        reason,
      });
    });

    client.on('reconnecting', (attempt) => {
      this.logger.warn('WeCom RAG bot websocket reconnecting', undefined, {
        tenantCode: config.tenantCode,
        attempt,
      });
    });

    client.on('error', (error) => {
      this.logger.error('WeCom RAG bot websocket error', undefined, {
        tenantCode: config.tenantCode,
        error: error.message,
      });
    });

    client.on('event.enter_chat', (frame) => {
      return this.replyWelcome(client, config, frame);
    });

    client.on('message.text', (frame) => {
      return this.handleTextMessage(client, config, frame);
    });

    client.on('message', (frame) => {
      if (frame.body?.msgtype !== MessageType.Text) {
        return this.handleUnsupportedMessage(client, config, frame);
      }
    });
  }

  private async replyWelcome(
    client: WSClient,
    config: TenantWecomRagBotConfig,
    frame: WecomEnterChatFrame,
  ) {
    try {
      await client.replyWelcome(frame, {
        msgtype: 'text',
        text: { content: WELCOME_TEXT },
      });
    } catch (error) {
      this.logger.error(
        'Failed to reply WeCom RAG welcome message',
        undefined,
        {
          tenantCode: config.tenantCode,
          error: this.formatError(error),
        },
      );
    }
  }

  private async handleTextMessage(
    client: WSClient,
    config: TenantWecomRagBotConfig,
    frame: WecomTextMessageFrame,
  ) {
    const context = this.buildMessageContext(frame);
    if (!context.question) {
      await this.replyText(client, frame, EMPTY_QUESTION_TIP, true);
      return;
    }

    this.logger.info('WeCom RAG question received', undefined, {
      tenantCode: config.tenantCode,
      msgId: context.msgId,
      chatId: context.chatId,
      userId: context.userId,
      chatType: context.chatType,
    });

    const streamId = generateReqId('rag_stream');
    let answerContent = '';

    try {
      await this.replyStream(client, frame, streamId, THINKING_TIP, false);

      await this.tenantContext.run(
        { tenantCode: config.tenantCode },
        async () => {
          for await (const event of this.ragService.streamAnswer(
            context.question,
            this.defaultTopK,
          )) {
            if (event.type !== 'answer') continue;

            const token = event.data;
            if (!token) continue;

            answerContent += token;
            await this.replyStream(client, frame, streamId, answerContent, false);
          }
        },
      );

      await this.replyStream(
        client,
        frame,
        streamId,
        answerContent
          ? `${answerContent}\n\n---\n来源：企业知识库检索结果。`
          : '根据当前资料无法确认。',
        true,
      );
    } catch (error) {
      this.logger.error('Failed to answer WeCom RAG question', undefined, {
        tenantCode: config.tenantCode,
        msgId: context.msgId,
        chatId: context.chatId,
        userId: context.userId,
        error: this.formatError(error),
      });
      await this.replyStream(
        client,
        frame,
        streamId,
        RAG_UNAVAILABLE_TIP,
        true,
      );
    }
  }

  private async handleUnsupportedMessage(
    client: WSClient,
    config: TenantWecomRagBotConfig,
    frame: WecomBaseMessageFrame,
  ) {
    this.logger.info('Unsupported WeCom RAG message received', undefined, {
      tenantCode: config.tenantCode,
      msgId: frame.body?.msgid,
      msgType: frame.body?.msgtype,
      chatId: this.resolveChatId(frame.body),
      userId: frame.body?.from?.userid,
    });
    await this.replyText(client, frame, UNSUPPORTED_MESSAGE_TIP, true);
  }

  private buildMessageContext(
    frame: WecomTextMessageFrame,
  ): WecomRagMessageContext {
    const body = frame.body;
    return {
      msgId: body.msgid,
      chatId: this.resolveChatId(body),
      userId: body.from?.userid ?? '',
      chatType: body.chattype,
      question: body.text?.content?.trim() ?? '',
    };
  }

  private resolveChatId(body: WecomBaseMessageFrame['body']) {
    if (body?.chattype === 'group') return body.chatid ?? '';
    return body?.from?.userid ?? body?.chatid ?? '';
  }

  private async replyText(
    client: WSClient,
    frame: WecomTextMessageFrame | WecomBaseMessageFrame,
    content: string,
    finish: boolean,
  ) {
    await this.replyStream(
      client,
      frame,
      generateReqId('rag_stream'),
      content,
      finish,
    );
  }

  private async replyStream(
    client: WSClient,
    frame: WecomTextMessageFrame | WecomBaseMessageFrame,
    streamId: string,
    content: string,
    finish: boolean,
  ) {
    await client.replyStreamNonBlocking(frame, streamId, content, finish);
  }

  private buildWecomLogger(config: TenantWecomRagBotConfig): WecomLogger {
    return {
      debug: (message: string, ...args: any[]) =>
        this.logger.debug(message, undefined, {
          tenantCode: config.tenantCode,
          args,
        }),
      info: (message: string, ...args: any[]) =>
        this.logger.info(message, undefined, {
          tenantCode: config.tenantCode,
          args,
        }),
      warn: (message: string, ...args: any[]) =>
        this.logger.warn(message, undefined, {
          tenantCode: config.tenantCode,
          args,
        }),
      error: (message: string, ...args: any[]) =>
        this.logger.error(message, undefined, {
          tenantCode: config.tenantCode,
          args,
        }),
    };
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private getWecomRagBotConfigs(): TenantWecomRagBotConfig[] {
    const tenantConfigs = NodeConfigService.get('tenantConfig');
    return Object.values(tenantCodeMap)
      .map((tenantCode) => {
        const wecomBot =
          tenantConfigs[tenantCode]?.wecomBot?.vcHelperClient;
        return wecomBot ? { tenantCode, ...wecomBot } : undefined;
      })
      .filter(Boolean) as TenantWecomRagBotConfig[];
  }
}
