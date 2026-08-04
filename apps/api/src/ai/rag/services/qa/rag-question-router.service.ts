import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { z } from 'zod/v3';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import type {
  RagMemoryMessage,
  RagResolvedSession,
} from '../../types/rag.type';
import type { RagQuestionRouteResult } from '../../types/rag-workflow.type';

const questionRouteSchema = z.object({
  route: z.enum(['rag', 'direct']),
  routeReason: z.string().trim().min(1),
});

/** 使用结构化模型输出判断问题应走知识库问答还是直接回答。 */
@Injectable()
export class RagQuestionRouterService {
  private readonly model: ChatOpenAI;
  private readonly outputParser =
    StructuredOutputParser.fromZodSchema(questionRouteSchema);

  /** 初始化低随机性的路由模型及其结构化输出解析器。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
    private readonly promptRegistry: PromptRegistryService,
  ) {
    this.logger.setContext(RagQuestionRouterService.name);
    this.model = new ChatOpenAI({
      temperature: 0,
      model: NodeConfigService.get('queryRewriteModelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
  }

  /** 结合问题和短期记忆选择问答路由，失败时安全回退到 RAG。 */
  async route(params: {
    question: string;
    memory: RagMemoryMessage[];
    session: RagResolvedSession;
    topK?: number;
  }): Promise<RagQuestionRouteResult> {
    const startedAt = Date.now();
    try {
      const prompt = await this.promptRegistry.buildPrompt('route', {
        question: params.question.trim(),
        memory: this.promptRegistry.formatMemory(params.memory),
        formatInstructions: this.outputParser.getFormatInstructions(),
      });
      const response = await this.model.invoke(prompt);
      const output = await this.outputParser.parse(
        this.extractContentText(response.content),
      );
      const result: RagQuestionRouteResult = {
        route: output.route,
        routeReason: output.routeReason,
        status: 'success',
        durationMs: Date.now() - startedAt,
      };
      this.logResult(params, result);
      return result;
    } catch (error) {
      const result: RagQuestionRouteResult = {
        route: 'rag',
        status: 'failed',
        durationMs: Date.now() - startedAt,
        fallbackReason: this.errorType(error),
      };
      this.logResult(params, result);
      return result;
    }
  }

  /** 记录路由结果、耗时和回退原因等诊断信息。 */
  private logResult(
    params: { session: RagResolvedSession; topK?: number },
    result: RagQuestionRouteResult,
  ) {
    this.logger.info('RAG question routing completed', undefined, {
      stage: 'rag_question_route',
      tenantCode: params.session.tenantCode ?? this.tenantContext.tenant,
      sessionKey: params.session.sessionKey,
      topK: params.topK,
      route: result.route,
      routeStatus: result.status,
      durationMs: result.durationMs,
      fallback: result.status === 'failed',
      errorType: result.fallbackReason,
    });
  }

  /** 将未知异常归一为可记录的错误类型。 */
  private errorType(error: unknown): string {
    return error instanceof Error ? error.name : typeof error;
  }

  /** 从模型可能返回的字符串或内容块中提取连续文本。 */
  private extractContentText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';

    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (!part || typeof part !== 'object') return '';
        const item = part as Record<string, unknown>;
        if (typeof item.text === 'string') return item.text;
        return typeof item.content === 'string' ? item.content : '';
      })
      .join('');
  }
}
