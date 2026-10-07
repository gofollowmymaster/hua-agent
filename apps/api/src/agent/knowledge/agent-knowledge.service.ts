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
import type {
  AgentKnowledgeDocumentCountRow,
  AgentKnowledgeDocumentIdRow,
} from './type/agent-knowledge-document.type';

const AGENT_DOCUMENT_SUMMARY_SELECT = {
  id: true,
  tenantCode: true,
  category: true,
  sourcePath: true,
  fileName: true,
  fileType: true,
  fileHash: true,
  fileSize: true,
  chunkCount: true,
  status: true,
  error: true,
  metadata: true,
  remoteUrl: true,
  docId: true,
  wikiNodeId: true,
  lastModifiedAt: true,
  breadcrumb: true,
  sourceType: true,
  currentVersion: true,
  createdAt: true,
  updatedAt: true,
  ingestedAt: true,
  _count: { select: { chunks: true } },
} satisfies Prisma.AgentDocumentSelect;

const NULLISH_CATEGORY_VALUES = new Set(['null', 'none', 'undefined', 'nil']);

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
    const keyword = params.keyword?.trim();
    if (keyword) {
      return this.pageDocumentsByKeyword(
        params,
        tenantCode,
        page,
        pageSize,
        keyword,
      );
    }
    const where = this.buildDocumentWhere(params, tenantCode);

    const [total, documents] = await Promise.all([
      this.ragPrisma.agentDocument.count({ where }),
      this.ragPrisma.agentDocument.findMany({
        where,
        select: AGENT_DOCUMENT_SUMMARY_SELECT,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      list: documents.map((document) => this.serializeDocument(document)),
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
      select: AGENT_DOCUMENT_SUMMARY_SELECT,
    });
    if (!document || document.tenantCode !== tenantCode) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }
    return this.serializeDocument(document);
  }

  /** 返回当前租户文档的管理元数据和完整原文，供 Business Agent 工具使用。 */
  async getDocumentForTool(id: number) {
    const document = await this.ragPrisma.agentDocument.findFirst({
      where: { id, tenantCode: this.currentTenant() },
      select: {
        ...AGENT_DOCUMENT_SUMMARY_SELECT,
        content: true,
      },
    });
    if (!document) {
      throw new BadRequestException(`Agent document #${id} not found`);
    }
    return {
      ...this.serializeDocument(document),
      content: document.content,
    };
  }

  /** 返回当前租户可检索的精确分类；无效工具参数降级为不筛选。 */
  async resolveSearchCategoryForTool(
    category?: string | null,
  ): Promise<string | undefined> {
    const normalized = category?.trim();
    if (!normalized || NULLISH_CATEGORY_VALUES.has(normalized.toLowerCase())) {
      return undefined;
    }
    const tenantCode = this.currentTenant();
    const document = await this.ragPrisma.agentDocument.findFirst({
      where: {
        tenantCode,
        category: normalized,
        chunks: { some: { tenantCode } },
      },
      select: { category: true },
    });
    return document?.category;
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
    return where;
  }

  /** 使用元数据包含匹配与 zhparser 文档原文匹配分页查询文档。 */
  private async pageDocumentsByKeyword(
    params: AgentKnowledgeDocumentPageDto,
    tenantCode: string,
    page: number,
    pageSize: number,
    keyword: string,
  ) {
    const matchingDocuments = Prisma.sql`
      WITH keyword_terms AS (
        SELECT DISTINCT term.lexeme
        FROM ts_debug('zhparser', ${keyword}) debug
        CROSS JOIN LATERAL unnest(debug.lexemes) AS term(lexeme)
        WHERE term.lexeme <> ''
      ),
      keyword_query AS (
        SELECT string_agg(quote_literal(lexeme), ' | ')::tsquery AS query
        FROM keyword_terms
      ),
      matching_documents AS (
        SELECT d.id, d.updated_at
        FROM agent_documents d
        CROSS JOIN keyword_query
        WHERE d.tenant_code = ${tenantCode}
          AND (${params.category ?? null}::text IS NULL OR d.category = ${params.category ?? null})
          AND (${params.status ?? null}::text IS NULL OR d.status = ${params.status ?? null})
          AND (
            strpos(d.file_name, ${keyword}) > 0
            OR strpos(d.source_path, ${keyword}) > 0
            OR strpos(COALESCE(d.breadcrumb, ''), ${keyword}) > 0
            OR (
              keyword_query.query IS NOT NULL
              AND to_tsvector('zhparser', d.content) @@ keyword_query.query
            )
          )
      )
    `;
    const [countRows, idRows] = await Promise.all([
      this.ragPrisma.$queryRaw<AgentKnowledgeDocumentCountRow[]>(
        Prisma.sql`${matchingDocuments}
          SELECT COUNT(*) AS count
          FROM matching_documents
        `,
      ),
      this.ragPrisma.$queryRaw<AgentKnowledgeDocumentIdRow[]>(
        Prisma.sql`${matchingDocuments}
          SELECT id
          FROM matching_documents
          ORDER BY updated_at DESC, id DESC
          LIMIT ${pageSize}
          OFFSET ${(page - 1) * pageSize}
        `,
      ),
    ]);
    const total = Number(countRows[0]?.count ?? 0);
    const ids = idRows.map((row) => row.id);
    if (ids.length === 0) {
      return { list: [], total, page, pageSize };
    }

    const documents = await this.ragPrisma.agentDocument.findMany({
      where: { id: { in: ids } },
      select: AGENT_DOCUMENT_SUMMARY_SELECT,
    });
    const order = new Map(ids.map((id, index) => [id.toString(), index]));
    documents.sort(
      (left, right) =>
        (order.get(left.id.toString()) ?? 0) -
        (order.get(right.id.toString()) ?? 0),
    );

    return {
      list: documents.map((document) => this.serializeDocument(document)),
      total,
      page,
      pageSize,
    };
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
