import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import { createUIMessageStream, type UIMessage } from 'ai';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import type { TenantCode } from '@src/config/tenant';
import {
  RagAdminDocumentPageDto,
  RagAdminIngestDto,
  RagAdminSessionPageDto,
} from '../dto/rag-admin.dto';
import { RagIngestService } from './rag-ingest.service';
import { RagPrismaService } from './prisma/rag-prisma.service';
import { RagService } from '../rag.service';

export interface RagAdminChatRequest {
  id?: string;
  messages?: UIMessage[];
  participantId?: string;
}

@Injectable()
export class RagAdminService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly ragIngestService: RagIngestService,
    private readonly tenantContext: TenantContext,
    private readonly ragService: RagService,
  ) {}

  async pageDocuments(params: RagAdminDocumentPageDto) {
    const { page, pageSize, skip } = this.resolvePage(params);
    const tenantCode = this.currentTenant();
    const where = this.buildDocumentWhere(params, tenantCode);

    const [total, documents] = await Promise.all([
      this.ragPrisma.aplusDocument.count({ where }),
      this.ragPrisma.aplusDocument.findMany({
        where,
        include: {
          _count: {
            select: { chunks: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      list: documents.map((document) => ({
        id: this.serializeBigInt(document.id),
        tenantCode: document.tenantCode,
        sourcePath: document.sourcePath,
        fileName: document.fileName,
        fileType: document.fileType,
        fileHash: document.fileHash,
        fileSize: this.serializeBigInt(document.fileSize),
        chunkCount: document.chunkCount,
        actualChunkCount: document._count.chunks,
        status: document.status,
        error: document.error,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        ingestedAt: document.ingestedAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  async deleteDocument(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      select: { id: true, tenantCode: true, sourcePath: true },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    await this.ragPrisma.aplusDocument.delete({ where: { id } });

    return {
      deleted: {
        id: this.serializeBigInt(document.id),
        tenantCode: document.tenantCode,
        sourcePath: document.sourcePath,
      },
    };
  }

  ingest(params: RagAdminIngestDto) {
    return this.ragIngestService.ingest({ force: Boolean(params?.force) });
  }

  async pageSessions(params: RagAdminSessionPageDto) {
    const { page, pageSize, skip } = this.resolvePage(params);
    const tenantCode = this.currentTenant();
    const where = this.buildSessionWhere(params, tenantCode);

    const [total, sessions] = await Promise.all([
      this.ragPrisma.aplusRagSession.count({ where }),
      this.ragPrisma.aplusRagSession.findMany({
        where,
        include: {
          _count: {
            select: { messages: true },
          },
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
        skip,
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
          : null,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastActiveAt: session.lastActiveAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  async listSessionMessages(sessionId: number) {
    const tenantCode = this.currentTenant();
    const session = await this.ragPrisma.aplusRagSession.findUnique({
      where: { id: sessionId },
      select: { id: true, tenantCode: true },
    });

    if (!session || session.tenantCode !== tenantCode) {
      throw new BadRequestException(`Session #${sessionId} not found`);
    }

    const messages = await this.ragPrisma.aplusRagMessage.findMany({
      where: {
        tenantCode,
        sessionId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => ({
      id: this.serializeBigInt(message.id),
      tenantCode: message.tenantCode,
      sessionId: this.serializeBigInt(message.sessionId),
      role: message.role,
      content: message.content,
      senderId: message.senderId,
      externalMessageId: message.externalMessageId,
      replyToMessageId: message.replyToMessageId,
      metadata: message.metadata,
      createdAt: message.createdAt,
    }));
  }

  createChatStream(params: RagAdminChatRequest) {
    const question = this.extractLatestUserText(params?.messages);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: 'text-start',
          id: textId,
        });

        try {
          for await (const event of this.ragService.streamAnswer(question, {
            session: {
              channel: 'web',
              conversationId,
              conversationType: 'rag-admin-demo',
              participantId,
              metadata: {
                source: 'rag-admin-assistant',
              },
            },
          })) {
            if (event.type === 'answer') {
              writer.write({
                type: 'text-delta',
                id: textId,
                delta: event.data,
              });
              continue;
            }

            writer.write({
              type: 'data-status',
              data: event.data,
            });
          }
        } finally {
          writer.write({
            type: 'text-end',
            id: textId,
          });
        }
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }

  private buildDocumentWhere(
    params: RagAdminDocumentPageDto,
    tenantCode: TenantCode,
  ): Prisma.AplusDocumentWhereInput {
    const where: Prisma.AplusDocumentWhereInput = { tenantCode };
    const keyword = params.keyword?.trim();

    if (keyword) {
      where.OR = [
        { fileName: { contains: keyword, mode: 'insensitive' } },
        { sourcePath: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (params.status?.trim()) {
      where.status = params.status.trim();
    }

    const updatedAt = this.buildDateRange(params.updatedFrom, params.updatedTo);
    if (updatedAt) {
      where.updatedAt = updatedAt;
    }

    return where;
  }

  private buildSessionWhere(
    params: RagAdminSessionPageDto,
    tenantCode: TenantCode,
  ): Prisma.AplusRagSessionWhereInput {
    const where: Prisma.AplusRagSessionWhereInput = { tenantCode };
    const keyword = params.keyword?.trim();

    if (params.channel?.trim()) {
      where.channel = params.channel.trim();
    }

    if (params.conversationId?.trim()) {
      where.conversationId = {
        contains: params.conversationId.trim(),
        mode: 'insensitive',
      };
    }

    if (params.userId?.trim()) {
      where.userId = {
        contains: params.userId.trim(),
        mode: 'insensitive',
      };
    }

    if (keyword) {
      where.OR = [
        { sessionKey: { contains: keyword, mode: 'insensitive' } },
        { conversationId: { contains: keyword, mode: 'insensitive' } },
        { userId: { contains: keyword, mode: 'insensitive' } },
        {
          messages: {
            some: {
              content: { contains: keyword, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const lastActiveAt = this.buildDateRange(
      params.activeFrom,
      params.activeTo,
    );
    if (lastActiveAt) {
      where.lastActiveAt = lastActiveAt;
    }

    return where;
  }

  private buildDateRange(from?: string, to?: string) {
    if (!from && !to) return undefined;
    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  private resolvePage(params: RagAdminDocumentPageDto | RagAdminSessionPageDto) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    return {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
    };
  }

  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  private serializeBigInt(value: bigint | number | string) {
    return typeof value === 'bigint' ? value.toString() : value;
  }

  private extractLatestUserText(messages?: UIMessage[]) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('messages is required');
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message?.role === 'user');
    const question = latestUserMessage?.parts
      ?.filter((part) => part?.type === 'text')
      .map((part) => ('text' in part ? part.text : ''))
      .join('')
      .trim();

    if (!question) {
      throw new BadRequestException('question text is required');
    }

    return question;
  }
}
