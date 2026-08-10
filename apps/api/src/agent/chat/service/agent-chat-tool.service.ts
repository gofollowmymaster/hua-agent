import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import { calculateExpression } from '../agent-chat-calculator';
import { AgentKnowledgeSearchService } from '../../knowledge/service/agent-knowledge-search.service';
import { AgentKnowledgeService } from '../../knowledge/agent-knowledge.service';

type AgentChatTool = ReturnType<typeof tool>;
type ToolArgs = Record<string, unknown>;

/** 提供业务 Agent 可调用的知识库工具和通用工具。 */
@Injectable()
export class AgentChatToolService {
  private readonly tools: AgentChatTool[];
  private readonly handlers: Record<
    string,
    (args: ToolArgs) => Promise<string>
  >;

  /** 初始化工具定义和对应执行处理器。 */
  constructor(
    private readonly knowledgeSearchService: AgentKnowledgeSearchService,
    private readonly knowledgeService: AgentKnowledgeService,
    private readonly tenantContext: TenantContext,
  ) {
    this.handlers = {
      search_knowledge: (args) => this.searchKnowledge(args),
      get_document: (args) => this.getDocument(args),
      get_document_chunks: (args) => this.getDocumentChunks(args),
      get_current_time: () => this.getCurrentTime(),
      calculate: (args) => this.calculate(args),
    };
    this.tools = [
      this.buildSearchKnowledgeTool(),
      this.buildGetDocumentTool(),
      this.buildGetDocumentChunksTool(),
      this.buildGetCurrentTimeTool(),
      this.buildCalculateTool(),
    ];
  }

  /** 返回 Agent 可绑定的工具列表。 */
  getTools() {
    return this.tools;
  }

  /** 按名称执行工具并返回字符串结果。 */
  async execute(name: string, args: ToolArgs): Promise<string> {
    const handler = this.handlers[name];
    if (!handler) {
      throw new Error(`Unknown agent tool: ${name}`);
    }
    return handler(args);
  }

  private buildSearchKnowledgeTool() {
    return tool(
      async ({ query, category, topK }) => {
        const hits = await this.knowledgeSearchService.search(query, {
          tenantCode: this.currentTenant(),
          mode: 'hybrid',
          category,
          topK: topK ?? 8,
        });
        return JSON.stringify(
          hits.map((hit) => ({
            id: hit.id,
            category: hit.category,
            fileName: hit.fileName,
            sourcePath: hit.sourcePath,
            remoteUrl: hit.remoteUrl,
            breadcrumb: hit.breadcrumb,
            score: hit.score,
            content: hit.content.slice(0, 1200),
          })),
        );
      },
      {
        name: 'search_knowledge',
        description: '在业务 Agent 知识库中检索相关知识片段',
        schema: z.object({
          query: z.string().describe('检索问题或关键词'),
          category: z.string().optional().describe('业务分类，如 业务流程'),
          topK: z.number().int().min(1).max(20).optional(),
        }),
      },
    );
  }

  private buildGetDocumentTool() {
    return tool(
      async ({ documentId }) => {
        const document = await this.knowledgeService.getDocument(
          Number(documentId),
        );
        return JSON.stringify({
          id: document.id,
          category: document.category,
          fileName: document.fileName,
          sourcePath: document.sourcePath,
          status: document.status,
          chunkCount: document.chunkCount,
          actualChunkCount: document.actualChunkCount,
          breadcrumb: document.breadcrumb,
          remoteUrl: document.remoteUrl,
          updatedAt: document.updatedAt,
        });
      },
      {
        name: 'get_document',
        description: '获取业务 Agent 知识库文档详情',
        schema: z.object({
          documentId: z.union([z.number(), z.string()]).describe('文档 ID'),
        }),
      },
    );
  }

  private buildGetDocumentChunksTool() {
    return tool(
      async ({ documentId, page, pageSize }) => {
        const result = await this.knowledgeService.pageDocumentChunks(
          Number(documentId),
          { page: page ?? 1, pageSize: pageSize ?? 10 },
        );
        return JSON.stringify({
          total: result.total,
          list: result.list.map((chunk) => ({
            id: chunk.id,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content.slice(0, 1200),
            metadata: chunk.metadata,
          })),
        });
      },
      {
        name: 'get_document_chunks',
        description: '分页获取业务 Agent 知识库文档切片',
        schema: z.object({
          documentId: z.union([z.number(), z.string()]).describe('文档 ID'),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(50).optional(),
        }),
      },
    );
  }

  private buildGetCurrentTimeTool() {
    return tool(async () => this.getCurrentTime(), {
      name: 'get_current_time',
      description: '获取 Asia/Shanghai 当前日期和时间',
      schema: z.object({}),
    });
  }

  private buildCalculateTool() {
    return tool(async ({ expression }) => this.calculate({ expression }), {
      name: 'calculate',
      description: '安全计算简单四则运算表达式，如 1+2*3',
      schema: z.object({
        expression: z.string().describe('只支持数字、括号和 + - * / 的表达式'),
      }),
    });
  }

  private async searchKnowledge(args: ToolArgs) {
    const query = String(args.query ?? '');
    const category = args.category ? String(args.category) : undefined;
    const topK = Number(args.topK) || 8;
    const hits = await this.knowledgeSearchService.search(query, {
      tenantCode: this.currentTenant(),
      mode: 'hybrid',
      category,
      topK,
    });
    return JSON.stringify(
      hits.map((hit) => ({
        id: hit.id,
        category: hit.category,
        fileName: hit.fileName,
        sourcePath: hit.sourcePath,
        remoteUrl: hit.remoteUrl,
        breadcrumb: hit.breadcrumb,
        score: hit.score,
        content: hit.content.slice(0, 1200),
      })),
    );
  }

  private async getDocument(args: ToolArgs) {
    const document = await this.knowledgeService.getDocument(
      Number(args.documentId),
    );
    return JSON.stringify({
      id: document.id,
      category: document.category,
      fileName: document.fileName,
      sourcePath: document.sourcePath,
      status: document.status,
      chunkCount: document.chunkCount,
      actualChunkCount: document.actualChunkCount,
      breadcrumb: document.breadcrumb,
      remoteUrl: document.remoteUrl,
      updatedAt: document.updatedAt,
    });
  }

  private async getDocumentChunks(args: ToolArgs) {
    const result = await this.knowledgeService.pageDocumentChunks(
      Number(args.documentId),
      { page: Number(args.page) || 1, pageSize: Number(args.pageSize) || 10 },
    );
    return JSON.stringify({
      total: result.total,
      list: result.list.map((chunk) => ({
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content.slice(0, 1200),
        metadata: chunk.metadata,
      })),
    });
  }

  private async getCurrentTime() {
    const now = new Date();
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(now);
  }

  private async calculate(args: ToolArgs) {
    const expression = String(args.expression ?? '');
    const result = calculateExpression(expression);
    return JSON.stringify({ expression, result });
  }

  private currentTenant(): string {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }
}
