import { Injectable } from '@nestjs/common';
import { tool, type DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import { calculateExpression } from '../agent-chat-calculator';
import { AgentKnowledgeSearchService } from '../../knowledge/service/agent-knowledge-search.service';
import { AgentKnowledgeService } from '../../knowledge/agent-knowledge.service';

type AgentChatTool = DynamicStructuredTool<any, any, any, string>;

/** 提供业务 Agent 可调用的知识库工具和通用工具。 */
@Injectable()
export class AgentChatToolService {
  private readonly tools: AgentChatTool[];

  /** 初始化业务 Agent 可绑定工具列表。 */
  constructor(
    private readonly knowledgeSearchService: AgentKnowledgeSearchService,
    private readonly knowledgeService: AgentKnowledgeService,
    private readonly tenantContext: TenantContext,
  ) {
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
    return tool(
      async () => {
        const now = new Date();
        return new Intl.DateTimeFormat('zh-CN', {
          timeZone: 'Asia/Shanghai',
          dateStyle: 'full',
          timeStyle: 'medium',
        }).format(now);
      },
      {
        name: 'get_current_time',
        description: '获取 Asia/Shanghai 当前日期和时间',
        schema: z.object({}),
      },
    );
  }

  private buildCalculateTool() {
    return tool(
      async ({ expression }) => {
        const result = calculateExpression(expression);
        return JSON.stringify({ expression, result });
      },
      {
        name: 'calculate',
        description: '安全计算简单四则运算表达式，如 1+2*3',
        schema: z.object({
          expression: z
            .string()
            .describe('只支持数字、括号和 + - * / 的表达式'),
        }),
      },
    );
  }

  private currentTenant(): string {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }
}
