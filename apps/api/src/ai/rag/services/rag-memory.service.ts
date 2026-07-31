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
} from '../types/rag.type';
import { RagPrismaService } from './prisma/rag-prisma.service';

const RAG_MEMORY_TTL_SECONDS = 60 * 60 * 48;
const RAG_MEMORY_MAX_MESSAGES = 20;
const DEFAULT_HTTP_CHANNEL = 'http';
const ASSISTANT_SENDER_ID = 'rag-assistant';

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

  resolveSession(options?: RagQueryOptions): RagResolvedSession {
    const input = options?.session ?? { channel: DEFAULT_HTTP_CHANNEL };
    const channel = this.normalizeSegment(input.channel || DEFAULT_HTTP_CHANNEL);
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

  async appendTurn(
    session: RagResolvedSession,
    question: string,
    answer: string,
  ) {
    await this.appendUserMessage(session, question);
    await this.appendAssistantMessage(session, answer);
  }

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

  formatMemory(messages: RagMemoryMessage[]) {
    if (messages.length === 0) return '无最近对话。';

    return messages
      .map((message, index) => {
        const role = message.role === 'user' ? '用户' : '助手';
        return `[${index + 1}] ${role}：${message.content}`;
      })
      .join('\n');
  }

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

  private async appendLongTermMessages(
    session: RagResolvedSession,
    messages: Array<
      Omit<Prisma.AplusRagMessageCreateManyInput, 'sessionId'>
    >,
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

  private buildRedisKey(session: RagResolvedSession) {
    return this.redisService.buildCacheKeyWithTemplates(
      RedisKeys.RAG_SESSION_MEMORY,
      {
        channel: session.channel,
        sessionKey: session.encodedSessionKey,
      },
    );
  }

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

  private encodeSessionKey(sessionKey: string) {
    return Buffer.from(sessionKey).toString('base64url');
  }

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

  private normalizeSegment(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  }

  private currentTenant() {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  private toJsonObject(
    value?: Record<string, unknown>,
  ): Prisma.InputJsonObject {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
