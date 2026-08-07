import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import type { TenantCode } from '@src/config/tenant';
import {
  RagAdminDocumentChunkPageDto,
  RagAdminDocumentMetadataDto,
  RagAdminDocumentPageDto,
  RagAdminIngestDto,
  RagAdminSessionPageDto,
} from './dto/rag-admin.dto';
import { RagIngestService } from '../rag/services/ingest/rag-ingest.service';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';

/** 编排 RAG 管理后台的租户级文档、切片和会话数据操作。 */
@Injectable()
export class RagAdminService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly ragIngestService: RagIngestService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 按租户和筛选条件分页返回文档及实际切片数量。 */
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
        type: document.type,
        tag: document.tag,
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

  /** 校验租户归属后返回单个文档详情。 */
  async getDocument(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    return {
      id: this.serializeBigInt(document.id),
      tenantCode: document.tenantCode,
      sourcePath: document.sourcePath,
      fileName: document.fileName,
      fileType: document.fileType,
      type: document.type,
      tag: document.tag,
      fileHash: document.fileHash,
      fileSize: this.serializeBigInt(document.fileSize),
      chunkCount: document.chunkCount,
      actualChunkCount: document._count.chunks,
      status: document.status,
      error: document.error,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      ingestedAt: document.ingestedAt,
    };
  }

  /** 校验文档归属后更新可维护的业务元数据。 */
  async updateDocumentMetadata(
    id: number,
    params: RagAdminDocumentMetadataDto,
  ) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      select: { id: true, tenantCode: true },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    const updated = await this.ragPrisma.aplusDocument.update({
      where: { id },
      data: {
        type: this.normalizeMetadataValue(params.type),
        tag: this.normalizeMetadataValue(params.tag),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        tenantCode: true,
        type: true,
        tag: true,
        updatedAt: true,
      },
    });

    return {
      id: this.serializeBigInt(updated.id),
      tenantCode: updated.tenantCode,
      type: updated.type,
      tag: updated.tag,
      updatedAt: updated.updatedAt,
    };
  }

  /** 校验租户归属后删除文档及其关联数据。 */
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

  /** 校验文档归属后分页返回其切片内容。 */
  async pageDocumentChunks(
    documentId: number,
    params: RagAdminDocumentChunkPageDto,
  ) {
    const { page, pageSize, skip } = this.resolvePage(params);
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id: documentId },
      select: { id: true, tenantCode: true },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${documentId} not found`);
    }

    const where: Prisma.AplusChunkWhereInput = {
      tenantCode,
      documentId,
    };
    const [total, chunks] = await Promise.all([
      this.ragPrisma.aplusChunk.count({ where }),
      this.ragPrisma.aplusChunk.findMany({
        where,
        orderBy: { chunkIndex: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      list: chunks.map((chunk) => ({
        id: this.serializeBigInt(chunk.id),
        tenantCode: chunk.tenantCode,
        documentId: this.serializeBigInt(chunk.documentId),
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        metadata: chunk.metadata,
        createdAt: chunk.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /** 在租户原始目录内解析并校验可预览的文档文件。 */
  async getDocumentPreviewFile(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.aplusDocument.findUnique({
      where: { id },
      select: {
        id: true,
        tenantCode: true,
        sourcePath: true,
        fileName: true,
        fileType: true,
        fileSize: true,
      },
    });

    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    const file = await this.resolvePreviewFilePath(
      tenantCode,
      document.sourcePath,
    );

    return {
      absolutePath: file.absolutePath,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: file.fileSize,
    };
  }

  /** 将管理端索引请求委托给摄取服务。 */
  ingest(params: RagAdminIngestDto) {
    return this.ragIngestService.ingest({ force: Boolean(params?.force) });
  }

  /** 按租户和筛选条件分页返回会话及最近消息摘要。 */
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

  /** 校验会话归属后按时间顺序返回全部消息。 */
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

  /** 将文档管理筛选条件转换为租户隔离的 Prisma 查询条件。 */
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

  /** 将会话管理筛选条件转换为租户隔离的 Prisma 查询条件。 */
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

    if (params.conversationType?.trim()) {
      where.conversationType = params.conversationType.trim();
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

  /** 根据可选起止时间构造 Prisma 日期范围。 */
  private buildDateRange(from?: string, to?: string) {
    if (!from && !to) return undefined;
    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  /** 清理可选元数据文本并统一空值表示。 */
  private normalizeMetadataValue(value?: string) {
    return value?.trim() ?? '';
  }

  /** 规范分页参数并计算数据库偏移量。 */
  private resolvePage(
    params:
      | RagAdminDocumentPageDto
      | RagAdminDocumentChunkPageDto
      | RagAdminSessionPageDto,
  ) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    return {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
    };
  }

  /** 获取请求租户，并在无请求上下文时回退到默认租户。 */
  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }

  /** 在租户原始目录内安全定位文档预览文件。 */
  private async resolvePreviewFilePath(
    tenantCode: TenantCode,
    sourcePath: string,
  ) {
    const rawRoot = path.resolve(
      process.cwd(),
      NodeConfigService.get('vcHelper').rawDir,
    );
    const tenantRawDir = path.join(rawRoot, tenantCode);
    const candidates = [
      path.resolve(tenantRawDir, sourcePath),
      path.resolve(process.cwd(), sourcePath),
    ];

    for (const candidate of candidates) {
      if (!this.isPathInside(candidate, tenantRawDir)) continue;

      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile()) {
          return {
            absolutePath: candidate,
            fileSize: stat.size,
          };
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }

    throw new BadRequestException('Document preview file not found');
  }

  /** 判断目标路径是否位于允许访问的父目录内。 */
  private isPathInside(filePath: string, parentDir: string) {
    const relativePath = path.relative(parentDir, filePath);
    return (
      relativePath === '' ||
      (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
    );
  }

  /** 将 JSON 不支持的 bigint 转换为可序列化字符串。 */
  private serializeBigInt(value: bigint | number | string) {
    return typeof value === 'bigint' ? value.toString() : value;
  }
}
