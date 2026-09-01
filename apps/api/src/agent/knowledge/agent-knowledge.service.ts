import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { NodeConfigService } from '@src/config/node-config.service';
import type { TenantCode } from '@src/config/tenant';
import { AgentKnowledgeIngestService } from './service/agent-knowledge-ingest.service';
import { AgentKnowledgeSearchService } from './service/agent-knowledge-search.service';
import type {
  AgentKnowledgeDocumentPageDto,
  AgentKnowledgeChunkPageDto,
  AgentKnowledgeIngestDto,
  AgentKnowledgeSearchDto,
} from './dto/agent-knowledge.dto';

/** 编排业务 Agent 知识库的租户级入库、检索和文档管理。 */
@Injectable()
export class AgentKnowledgeService {
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly ingestService: AgentKnowledgeIngestService,
    private readonly searchService: AgentKnowledgeSearchService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** 触发当前租户 docs 目录的重新入库。 */
  ingest(params: AgentKnowledgeIngestDto) {
    return this.ingestService.ingest({
      force: Boolean(params.force),
      tenantCode: this.currentTenant(),
    });
  }

  /** 按当前租户和请求模式检索知识库片段。 */
  search(params: AgentKnowledgeSearchDto) {
    return this.searchService.search(params.query, {
      tenantCode: this.currentTenant(),
      mode: params.mode ?? 'hybrid',
      category: params.category,
      topK: params.topK ?? 8,
    });
  }

  /** 按当前租户和筛选条件分页返回文档及实际切片数量。 */
  async pageDocuments(params: AgentKnowledgeDocumentPageDto) {
    const tenantCode = this.currentTenant();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = this.buildDocumentWhere(params, tenantCode);

    const [total, documents] = await Promise.all([
      this.ragPrisma.agentDocument.count({ where }),
      this.ragPrisma.agentDocument.findMany({
        where,
        include: {
          _count: { select: { chunks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      list: documents.map((document) => ({
        id: this.serializeBigInt(document.id),
        tenantCode: document.tenantCode,
        category: document.category,
        sourcePath: document.sourcePath,
        fileName: document.fileName,
        fileType: document.fileType,
        fileHash: document.fileHash,
        fileSize: this.serializeBigInt(document.fileSize),
        chunkCount: document.chunkCount,
        actualChunkCount: document._count.chunks,
        status: document.status,
        error: document.error,
        metadata: document.metadata,
        remoteUrl: document.remoteUrl,
        docId: document.docId,
        wikiNodeId: document.wikiNodeId,
        lastModifiedAt: document.lastModifiedAt,
        breadcrumb: document.breadcrumb,
        sourceType: document.sourceType,
        currentVersion: document.currentVersion,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        ingestedAt: document.ingestedAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /** 校验租户归属后返回单个文档详情及实际切片数。 */
  async getDocument(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.agentDocument.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
      },
    });
    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }
    return this.serializeDocument(document);
  }

  /** 校验租户归属后分页返回文档切片。 */
  async pageDocumentChunks(id: number, params: AgentKnowledgeChunkPageDto) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.agentDocument.findUnique({
      where: { id },
      select: { id: true, tenantCode: true },
    });
    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where: Prisma.AgentChunkWhereInput = {
      tenantCode,
      documentId: id,
    };
    const [total, chunks] = await Promise.all([
      this.ragPrisma.agentChunk.count({ where }),
      this.ragPrisma.agentChunk.findMany({
        where,
        orderBy: { chunkIndex: 'asc' },
        skip: (page - 1) * pageSize,
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

  /** 校验租户归属后在 docs 根目录内解析可预览的原始文件。 */
  async getDocumentPreviewFile(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.agentDocument.findUnique({
      where: { id },
      select: {
        id: true,
        tenantCode: true,
        sourcePath: true,
        fileName: true,
        fileType: true,
      },
    });
    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }

    const docsRoot = path.resolve(
      process.cwd(),
      NodeConfigService.get('agentKnowledge').docsDir,
    );
    const absolutePath = path.resolve(docsRoot, document.sourcePath);
    if (!this.isPathInside(absolutePath, docsRoot)) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }

    try {
      const stat = await fs.stat(absolutePath);
      if (!stat.isFile()) {
        throw new BadRequestException('Preview file not found');
      }
      return {
        absolutePath,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: stat.size,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new BadRequestException('Preview file not found');
      }
      throw error;
    }
  }

  /** 校验租户归属后删除文档及其全部切片。 */
  async deleteDocument(id: number) {
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.agentDocument.findUnique({
      where: { id },
      select: { id: true, tenantCode: true, sourcePath: true },
    });
    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }

    await this.ragPrisma.agentDocument.delete({ where: { id } });
    return {
      deleted: {
        id: this.serializeBigInt(document.id),
        tenantCode: document.tenantCode,
        sourcePath: document.sourcePath,
      },
    };
  }

  /** 构造按租户和筛选条件的文档查询条件。 */
  private buildDocumentWhere(
    params: AgentKnowledgeDocumentPageDto,
    tenantCode: string,
  ): Prisma.AgentDocumentWhereInput {
    const where: Prisma.AgentDocumentWhereInput = { tenantCode };
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.keyword?.trim()) {
      const keyword = params.keyword.trim();
      where.OR = [
        { fileName: { contains: keyword } },
        { sourcePath: { contains: keyword } },
        { breadcrumb: { contains: keyword } },
      ];
    }
    return where;
  }

  /** 将 JSON 不支持的 bigint 转换为可序列化字符串。 */
  private serializeBigInt(value: bigint | number | string) {
    return typeof value === 'bigint' ? value.toString() : value;
  }

  /** 将文档及实际切片数转换为可序列化响应。 */
  private serializeDocument(document: {
    id: bigint | number;
    tenantCode: string;
    category: string;
    sourcePath: string;
    fileName: string;
    fileType: string;
    fileHash: string;
    fileSize: bigint | number;
    chunkCount: number;
    status: string;
    error: string | null;
    metadata: Prisma.JsonValue;
    remoteUrl: string | null;
    docId: string | null;
    wikiNodeId: string | null;
    lastModifiedAt: string | null;
    breadcrumb: string | null;
    sourceType: string | null;
    currentVersion: string | null;
    createdAt: Date;
    updatedAt: Date;
    ingestedAt: Date | null;
    _count: { chunks: number };
  }) {
    return {
      id: this.serializeBigInt(document.id),
      tenantCode: document.tenantCode,
      category: document.category,
      sourcePath: document.sourcePath,
      fileName: document.fileName,
      fileType: document.fileType,
      fileHash: document.fileHash,
      fileSize: this.serializeBigInt(document.fileSize),
      chunkCount: document.chunkCount,
      actualChunkCount: document._count.chunks,
      status: document.status,
      error: document.error,
      metadata: document.metadata,
      remoteUrl: document.remoteUrl,
      docId: document.docId,
      wikiNodeId: document.wikiNodeId,
      lastModifiedAt: document.lastModifiedAt,
      breadcrumb: document.breadcrumb,
      sourceType: document.sourceType,
      currentVersion: document.currentVersion,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      ingestedAt: document.ingestedAt,
    };
  }

  /** 判断目标路径是否位于允许访问的父目录内。 */
  private isPathInside(filePath: string, parentDir: string) {
    const relativePath = path.relative(parentDir, filePath);
    return (
      relativePath === '' ||
      (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
    );
  }

  /** 获取请求租户，并在无请求上下文时回退到默认租户。 */
  private currentTenant(): TenantCode {
    return this.tenantContext.tenant;
  }
}
