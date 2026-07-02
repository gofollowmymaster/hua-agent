import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WSClient, generateReqId, MessageType } from '@wecom/aibot-node-sdk';
import type { Logger as WecomLogger } from '@wecom/aibot-node-sdk';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagService } from './rag.service';
import { getWecomRagBotConfig, WecomRagBotConfig } from './rag.config';
import type {
  WecomBaseMessageFrame,
  WecomEnterChatFrame,
  WecomRagMessageContext,
  WecomTextMessageFrame,
} from './types/wecom-rag.type';

const EMPTY_QUESTION_TIP = '请发送需要查询的文本问题。';
const UNSUPPORTED_MESSAGE_TIP = '不支持该消息类型，请发送文本问题。';
const RAG_UNAVAILABLE_TIP = '知识库问答暂时不可用，请稍后重试。';
const THINKING_TIP = '正在检索知识库，请稍候...\n\n';
const WELCOME_TEXT = '您好，我是企业知识库问答助手。请直接发送文本问题。';

@Injectable()
export class WecomRagBotService implements OnModuleInit, OnModuleDestroy {
  private readonly config: WecomRagBotConfig;
  private client?: WSClient;

  constructor(
    private readonly ragService: RagService,
    private readonly logger: LoggerService,
  ) {
    this.config = getWecomRagBotConfig();
  }

  onModuleInit() {
    if (!this.config.enabled) {
      this.logger.info('WeCom RAG bot is disabled');
      return;
    }

    if (!this.config.botId || !this.config.secret) {
      this.logger.warn('WeCom RAG bot config is incomplete');
      return;
    }

    this.client = new WSClient({
      botId: this.config.botId,
      secret: this.config.secret,
      wsUrl: this.config.wsUrl,
      maxReconnectAttempts: -1,
      logger: this.buildWecomLogger(),
    });

    this.bindEvents(this.client);
    this.client.connect();
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  private bindEvents(client: WSClient) {
    client.on('connected', () => {
      this.logger.info('WeCom RAG bot websocket connected');
    });

    client.on('authenticated', () => {
      this.logger.info('WeCom RAG bot authenticated');
    });

    client.on('disconnected', (reason) => {
      this.logger.warn('WeCom RAG bot websocket disconnected', undefined, {
        reason,
      });
    });

    client.on('reconnecting', (attempt) => {
      this.logger.warn('WeCom RAG bot websocket reconnecting', undefined, {
        attempt,
      });
    });

    client.on('error', (error) => {
      this.logger.error('WeCom RAG bot websocket error', undefined, {
        error: error.message,
      });
    });

    client.on('event.enter_chat', (frame) => {
      return this.replyWelcome(frame);
    });

    client.on('message.text', (frame) => {
      return this.handleTextMessage(frame);
    });

    client.on('message', (frame) => {
      if (frame.body?.msgtype !== MessageType.Text) {
        return this.handleUnsupportedMessage(frame);
      }
    });
  }

  private async replyWelcome(frame: WecomEnterChatFrame) {
    try {
      await this.client?.replyWelcome(frame, {
        msgtype: 'text',
        text: { content: WELCOME_TEXT },
      });
    } catch (error) {
      this.logger.error(
        'Failed to reply WeCom RAG welcome message',
        undefined,
        {
          error: this.formatError(error),
        },
      );
    }
  }

  private async handleTextMessage(frame: WecomTextMessageFrame) {
    const context = this.buildMessageContext(frame);
    if (!context.question) {
      await this.replyText(frame, EMPTY_QUESTION_TIP, true);
      return;
    }

    this.logger.info('WeCom RAG question received', undefined, {
      msgId: context.msgId,
      chatId: context.chatId,
      userId: context.userId,
      chatType: context.chatType,
    });

    const streamId = generateReqId('rag_stream');
    let answerContent = '';

    try {
      await this.replyStream(frame, streamId, THINKING_TIP, false);

      for await (const event of this.ragService.streamAnswer(
        context.question,
        this.config.defaultTopK,
      )) {
        if (event.type !== 'answer') continue;

        const token = event.data;
        if (!token) continue;

        answerContent += token;
        await this.replyStream(frame, streamId, answerContent, false);
      }

      await this.replyStream(
        frame,
        streamId,
        answerContent
          ? `${answerContent}\n\n---\n来源：企业知识库检索结果。`
          : '根据当前资料无法确认。',
        true,
      );
    } catch (error) {
      this.logger.error('Failed to answer WeCom RAG question', undefined, {
        msgId: context.msgId,
        chatId: context.chatId,
        userId: context.userId,
        error: this.formatError(error),
      });
      await this.replyStream(frame, streamId, RAG_UNAVAILABLE_TIP, true);
    }
  }

  private async handleUnsupportedMessage(frame: WecomBaseMessageFrame) {
    this.logger.info('Unsupported WeCom RAG message received', undefined, {
      msgId: frame.body?.msgid,
      msgType: frame.body?.msgtype,
      chatId: this.resolveChatId(frame.body),
      userId: frame.body?.from?.userid,
    });
    await this.replyText(frame, UNSUPPORTED_MESSAGE_TIP, true);
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
    frame: WecomTextMessageFrame | WecomBaseMessageFrame,
    content: string,
    finish: boolean,
  ) {
    await this.replyStream(frame, generateReqId('rag_stream'), content, finish);
  }

  private async replyStream(
    frame: WecomTextMessageFrame | WecomBaseMessageFrame,
    streamId: string,
    content: string,
    finish: boolean,
  ) {
    if (!this.client) return;
    await this.client.replyStreamNonBlocking(frame, streamId, content, finish);
  }

  private buildWecomLogger(): WecomLogger {
    return {
      debug: (message: string, ...args: any[]) =>
        this.logger.debug(message, undefined, { args }),
      info: (message: string, ...args: any[]) =>
        this.logger.info(message, undefined, { args }),
      warn: (message: string, ...args: any[]) =>
        this.logger.warn(message, undefined, { args }),
      error: (message: string, ...args: any[]) =>
        this.logger.error(message, undefined, { args }),
    };
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
