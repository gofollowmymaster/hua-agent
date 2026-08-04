import { Injectable } from '@nestjs/common';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RedisService } from '@src/common/service/redis/redis.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { Prisma } from '@prisma/rag-client';
import type {
  RagMemoryMessage,
  RagQueryOptions,
  RagResolvedSession,
  RagSessionInput,
} from '../../types/rag.type';
import { RagPrismaService } from '../prisma/rag-prisma.service';

const RAG_MEMORY_TTL_SECONDS = 60 * 60 * 48;
const RAG_MEMORY_MAX_MESSAGES = 20;
const DEFAULT_HTTP_CHANNEL = 'http';
const ASSISTANT_SENDER_ID = 'rag-assistant';

/** 管理租户问答会话标识、Redis 短期记忆和数据库长期消息。 */
@Injectable()
export class RagMemoryService {
  constructor(
    private readonly redisService: RedisService,
    private readonly ragPrisma: RagPrismaService,
    private readonly tenantContext: TenantContext,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RagMemoryService.name);
  }

  /** 规范会话输入并生成租户隔离的稳定会话标识。 */
  resolveSession(options?: RagQueryOptions): RagResolvedSession {
    const input = options?.session ?? { channel: DEFAULT_HTTP_CHANNEL };
    const channel = this.normalizeSegment(
      input.channel || DEFAULT_HTTP_CHANNEL,
    );
    const tenantCode = this.currentTenant();
    const sessionKey = this.buildSessionKey(input);

    return {
      ...input,
      channel,
      tenantCode,
      sessionKey,
      encodedSessionKey: this.encodeSessionKey(sessionKey),
    };
  }

  /** 从 Redis 加载最近对话，读取或解析失败时降级为空记忆。 */
  async loadShortTermMemory(
    session: RagResolvedSession,
  ): Promise<RagMemoryMessage[]> {
    const key = this.buildRedisKey(session);
    try {
      const values = await this.redisService.getClient().lrange(key, 0, -1);
      return values
        .map((value) => this.parseMemoryMessage(value, session))
        .filter((item): item is RagMemoryMessage => Boolean(item));
    } catch (error) {
      this.logger.warn('Failed to load RAG short-term memory', undefined, {
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        error: this.formatError(error),
      });
      return [];
    }
  }

  /** 依次持久化一轮用户问题和助手答案。 */
  async appendTurn(
    session: RagResolvedSession,
    question: string,
    answer: string,
  ) {
    await this.appendUserMessage(session, question);
    await this.appendAssistantMessage(session, answer);
  }

  /** 将有效用户问题并行写入短期记忆和长期消息。 */
  async appendUserMessage(session: RagResolvedSession, question: string) {
    if (!question.trim()) return;

    const userMessage = this.buildUserMemoryMessage(session, question);

    await Promise.all([
      this.appendShortTermMemory(session, [userMessage]),
      this.appendLongTermMessages(session, [
        {
          tenantCode: session.tenantCode,
          role: 'user',
          content: question,
          senderId: session.participantId,
          externalMessageId: session.messageId,
          metadata: this.buildUserMessageMetadata(session),
        },
      ]),
    ]);
  }

  /** 将有效助手答案并行写入短期记忆和长期消息。 */
  async appendAssistantMessage(session: RagResolvedSession, answer: string) {
    if (!answer.trim()) return;

    const assistantMessage = this.buildAssistantMemoryMessage(session, answer);

    await Promise.all([
      this.appendShortTermMemory(session, [assistantMessage]),
      this.appendLongTermMessages(session, [
        {
          tenantCode: session.tenantCode,
          role: 'assistant',
          content: answer,
          senderId: ASSISTANT_SENDER_ID,
          replyToMessageId: session.messageId,
          metadata: this.buildAssistantMessageMetadata(session),
        },
      ]),
    ]);
  }

  /** 构造包含渠道与发送者上下文的用户短期记忆消息。 */
  private buildUserMemoryMessage(
    session: RagResolvedSession,
    question: string,
  ): RagMemoryMessage {
    return {
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
      metadata: {
        messageId: session.messageId,
        participantId: session.participantId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        channel: session.channel,
      },
    };
  }

  /** 构造包含回复关系与渠道上下文的助手短期记忆消息。 */
  private buildAssistantMemoryMessage(
    session: RagResolvedSession,
    answer: string,
  ): RagMemoryMessage {
    return {
      role: 'assistant',
      content: answer,
      createdAt: new Date().toISOString(),
      metadata: {
        replyToMessageId: session.messageId,
        answeredParticipantId: session.participantId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        channel: session.channel,
      },
    };
  }

  /** 追加 Redis 消息，并限制窗口长度和刷新过期时间。 */
  private async appendShortTermMemory(
    session: RagResolvedSession,
    messages: RagMemoryMessage[],
  ) {
    const key = this.buildRedisKey(session);
    try {
      const client = this.redisService.getClient();
      await client.rpush(key, ...messages.map((item) => JSON.stringify(item)));
      await client.ltrim(key, -RAG_MEMORY_MAX_MESSAGES, -1);
      await client.expire(key, RAG_MEMORY_TTL_SECONDS);
    } catch (error) {
      this.logger.warn('Failed to append RAG short-term memory', undefined, {
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        error: this.formatError(error),
      });
    }
  }

  /** 确保会话存在后批量写入数据库长期消息，失败时记录但不中断问答。 */
  private async appendLongTermMessages(
    session: RagResolvedSession,
    messages: Array<Omit<Prisma.AplusRagMessageCreateManyInput, 'sessionId'>>,
  ) {
    if (messages.length === 0) return;

    try {
      const sessionId = await this.upsertSession(session);
      await this.ragPrisma.aplusRagMessage.createMany({
        data: messages.map((message) => ({ ...message, sessionId })),
      });
    } catch (error) {
      this.logger.error('Failed to append RAG long-term history', undefined, {
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        error: this.formatError(error),
      });
    }
  }

  /** 新建或刷新租户会话，并返回后续消息关联所需的 ID。 */
  private async upsertSession(session: RagResolvedSession): Promise<bigint> {
    const result = await this.ragPrisma.aplusRagSession.upsert({
      where: {
        tenantCode_channel_sessionKey: {
          tenantCode: session.tenantCode,
          channel: session.channel,
          sessionKey: session.sessionKey,
        },
      },
      create: {
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        userId: session.participantId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        metadata: this.toJsonObject(session.metadata),
        lastActiveAt: new Date(),
      },
      update: {
        userId: session.participantId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        metadata: this.toJsonObject(session.metadata),
        updatedAt: new Date(),
        lastActiveAt: new Date(),
      },
      select: { id: true },
    });

    return result.id;
  }

  /** 使用统一模板构造带租户、渠道和会话标识的 Redis key。 */
  private buildRedisKey(session: RagResolvedSession) {
    return this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.RAG_SESSION_MEMORY,
      {
        channel: session.channel,
        sessionKey: session.encodedSessionKey,
      },
    );
  }

  /** 优先从渠道会话信息生成稳定 key，无标识时生成请求级临时 key。 */
  private buildSessionKey(input: RagSessionInput) {
    const conversationType = this.normalizeSegment(
      input.conversationType || 'conversation',
    );
    if (input.conversationId && input.participantId) {
      return [
        conversationType,
        input.conversationId.trim(),
        input.participantId.trim(),
      ].join(':');
    }

    if (input.conversationId) {
      return [conversationType, input.conversationId.trim()].join(':');
    }

    return `request:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  /** 将会话 key 编码为适合嵌入 Redis key 的 URL 安全文本。 */
  private encodeSessionKey(sessionKey: string) {
    return Buffer.from(sessionKey).toString('base64url');
  }

  /** 解析并校验 Redis 中的短期记忆消息，坏数据会被忽略并记录。 */
  private parseMemoryMessage(
    value: string,
    session: RagResolvedSession,
  ): RagMemoryMessage | undefined {
    try {
      const parsed = JSON.parse(value) as RagMemoryMessage;
      if (!['user', 'assistant'].includes(parsed.role)) return undefined;
      if (typeof parsed.content !== 'string') return undefined;
      return parsed;
    } catch (error) {
      this.logger.warn('Failed to parse RAG memory message', undefined, {
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        error: this.formatError(error),
      });
      return undefined;
    }
  }

  /** 汇总用户消息持久化所需的渠道和回复元数据。 */
  private buildUserMessageMetadata(session: RagResolvedSession) {
    return this.toJsonObject({
      ...(session.metadata ?? {}),
      channel: session.channel,
      conversationId: session.conversationId,
      conversationType: session.conversationType,
      participantId: session.participantId,
      messageId: session.messageId,
      replyToMessageId: session.replyToMessageId,
    });
  }

  /** 汇总助手消息持久化所需的渠道和回答对象元数据。 */
  private buildAssistantMessageMetadata(session: RagResolvedSession) {
    return this.toJsonObject({
      ...(session.metadata ?? {}),
      channel: session.channel,
      conversationId: session.conversationId,
      conversationType: session.conversationType,
      answeredParticipantId: session.participantId,
      replyToMessageId: session.messageId,
    });
  }

  /** 将会话标识片段规范为小写且可安全拼接的字符集。 */
  private normalizeSegment(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
  }

  /** 获取请求租户，并在无请求上下文时回退到默认租户。 */
  private currentTenant() {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  /** 将普通对象转换为 Prisma 接受的 JSON 输入对象。 */
  private toJsonObject(
    value?: Record<string, unknown>,
  ): Prisma.InputJsonObject {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  /** 将未知异常转换为适合结构化日志的消息。 */
  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
