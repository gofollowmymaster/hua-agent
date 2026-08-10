import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import type { AgentChatSessionPageDto } from '../dto/agent-chat.dto';
import type {
  AgentChatHistoryMessage,
  AgentChatResolvedSession,
  AgentChatSessionInput,
  AgentChatToolCallRecord,
} from '../type/agent-chat.type';

/** 管理业务 Agent 独立会话、消息持久化和历史查询。 */
@Injectable()
export class AgentChatMemoryService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 规范会话输入并生成租户隔离的稳定会话标识。 */
  resolveSession(input: AgentChatSessionInput): AgentChatResolvedSession {
    const tenantCode = this.tenantContext.tenant;
    const channel = input.channel || 'agent-web';
    const sessionKey = this.buildSessionKey(input);
    return {
      ...input,
      tenantCode,
      channel,
      sessionKey,
    };
  }

  /** 加载最近对话历史，供模型作为上下文使用。 */
  async loadRecentMessages(
    session: AgentChatResolvedSession,
    limit = 10,
  ): Promise<AgentChatHistoryMessage[]> {
    const sessionId = await this.resolveSessionId(session);
    const messages = await this.ragPrisma.agentChatMessage.findMany({
      where: { tenantCode: session.tenantCode, sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return messages
      .reverse()
      .filter(
        (message): message is typeof message & { role: 'user' | 'assistant' } =>
          message.role === 'user' || message.role === 'assistant',
      )
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      }));
  }

  /** 持久化当前用户问题并刷新会话活跃时间。 */
  async appendUserMessage(
    session: AgentChatResolvedSession,
    content: string,
    messageId?: string,
  ) {
    const sessionId = await this.resolveSessionId(session);
    await this.ragPrisma.$transaction([
      this.ragPrisma.agentChatMessage.create({
        data: {
          tenantCode: session.tenantCode,
          sessionId,
          role: 'user',
          content,
          senderId: session.participantId,
          externalMessageId: messageId,
          metadata: this.buildMessageMetadata(session) as Prisma.InputJsonValue,
        },
      }),
      this.ragPrisma.agentChatSession.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date(), updatedAt: new Date() },
      }),
    ]);
  }

  /** 持久化助手答案及工具调用记录并刷新会话活跃时间。 */
  async appendAssistantMessage(
    session: AgentChatResolvedSession,
    content: string,
    toolCalls: AgentChatToolCallRecord[] = [],
  ) {
    const sessionId = await this.resolveSessionId(session);
    await this.ragPrisma.$transaction([
      this.ragPrisma.agentChatMessage.create({
        data: {
          tenantCode: session.tenantCode,
          sessionId,
          role: 'assistant',
          content,
          toolCalls: toolCalls as unknown as Prisma.InputJsonValue,
          replyToMessageId: session.messageId,
          metadata: this.buildMessageMetadata(session) as Prisma.InputJsonValue,
        },
      }),
      this.ragPrisma.agentChatSession.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date(), updatedAt: new Date() },
      }),
    ]);
  }

  /** 按当前租户和筛选条件分页返回会话及最近消息摘要。 */
  async pageSessions(params: AgentChatSessionPageDto) {
    const tenantCode = this.tenantContext.tenant;
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = this.buildSessionWhere(params, tenantCode);

    const [total, sessions] = await Promise.all([
      this.ragPrisma.agentChatSession.count({ where }),
      this.ragPrisma.agentChatSession.findMany({
        where,
        include: {
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { lastActiveAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      list: sessions.map((session) => ({
        id: this.serializeBigInt(session.id),
        tenantCode: session.tenantCode,
        channel: session.channel,
        sessionKey: session.sessionKey,
        userId: session.userId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        metadata: session.metadata,
        messageCount: session._count.messages,
        latestMessage: session.messages[0]
          ? {
              id: this.serializeBigInt(session.messages[0].id),
              role: session.messages[0].role,
              content: session.messages[0].content,
              createdAt: session.messages[0].createdAt,
            }
          : undefined,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastActiveAt: session.lastActiveAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /** 校验租户归属后返回会话完整消息。 */
  async listSessionMessages(id: number) {
    const tenantCode = this.tenantContext.tenant;
    const session = await this.ragPrisma.agentChatSession.findUnique({
      where: { id },
      select: { id: true, tenantCode: true },
    });
    if (!session || session.tenantCode !== tenantCode) return [];

    const messages = await this.ragPrisma.agentChatMessage.findMany({
      where: { tenantCode, sessionId: id },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((message) => ({
      id: this.serializeBigInt(message.id),
      tenantCode: message.tenantCode,
      sessionId: this.serializeBigInt(message.sessionId),
      role: message.role,
      content: message.content,
      toolCalls: message.toolCalls,
      senderId: message.senderId,
      externalMessageId: message.externalMessageId,
      replyToMessageId: message.replyToMessageId,
      metadata: message.metadata,
      createdAt: message.createdAt,
    }));
  }

  /** 新建或刷新当前租户会话并返回稳定会话 ID。 */
  private async resolveSessionId(session: AgentChatResolvedSession) {
    const result = await this.ragPrisma.agentChatSession.upsert({
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
        metadata: (session.metadata ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        userId: session.participantId,
        conversationId: session.conversationId,
        conversationType: session.conversationType,
        metadata: (session.metadata ?? {}) as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      select: { id: true },
    });
    return result.id;
  }

  /** 构造按租户和筛选条件的会话查询条件。 */
  private buildSessionWhere(
    params: AgentChatSessionPageDto,
    tenantCode: string,
  ): Prisma.AgentChatSessionWhereInput {
    const where: Prisma.AgentChatSessionWhereInput = { tenantCode };
    if (params.channel) where.channel = params.channel;
    if (params.conversationType)
      where.conversationType = params.conversationType;
    if (params.userId) where.userId = params.userId;
    if (params.keyword?.trim()) {
      where.OR = [
        { sessionKey: { contains: params.keyword.trim() } },
        { conversationId: { contains: params.keyword.trim() } },
      ];
    }
    return where;
  }

  /** 构造消息扩展元数据，便于后续排查渠道和会话来源。 */
  private buildMessageMetadata(session: AgentChatResolvedSession) {
    return {
      channel: session.channel,
      conversationId: session.conversationId,
      conversationType: session.conversationType,
      participantId: session.participantId,
      ...(session.metadata ?? {}),
    };
  }

  /** 按渠道和参与者生成稳定会话 key。 */
  private buildSessionKey(input: AgentChatSessionInput) {
    const conversation = input.conversationId || 'anonymous';
    const participant = input.participantId || 'anonymous';
    return `conversation:${conversation}:user:${participant}`;
  }

  /** 将 JSON 不支持的 bigint 转换为可序列化字符串。 */
  private serializeBigInt(value: bigint | number | string) {
    return typeof value === 'bigint' ? value.toString() : value;
  }
}
