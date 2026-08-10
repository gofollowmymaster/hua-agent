import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/rag-client';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import type { TenantCode } from '@src/config/tenant';
import { AgentKnowledgeIngestService } from './service/agent-knowledge-ingest.service';
import { AgentKnowledgeSearchService } from './service/agent-knowledge-search.service';
import type {
  AgentKnowledgeDocumentPageDto,
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
    console.log('[ documents ] >', documents);

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

  /** 获取请求租户，并在无请求上下文时回退到默认租户。 */
  private currentTenant(): TenantCode {
    return this.tenantContext.tenant;
  }
}
