import { Injectable } from '@nestjs/common';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { z } from 'zod/v3';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import type {
  RagMemoryMessage,
  RagResolvedSession,
} from '../../types/rag.type';

export interface RagQueryRewriteResult {
  originalQuestion: string;
  rewrittenQuestion: string;
  usedRewrite: boolean;
  rewriteReason: string;
  fallbackReason?: string;
}

const queryRewriteSchema = z.object({
  rewrittenQuestion: z.string().describe('适合向量检索的独立查询'),
  rewriteReason: z.string().describe('一句简短中文说明为什么这样改写'),
});

type RagQueryRewriteModelOutput = z.infer<typeof queryRewriteSchema>;

/** 使用会话记忆将上下文相关问题改写为独立检索查询。 */
@Injectable()
export class RagQueryRewriteService {
  private readonly model: ChatOpenAI;
  private readonly outputParser =
    StructuredOutputParser.fromZodSchema(queryRewriteSchema);

  /** 初始化低随机性的改写模型及其结构化输出解析器。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
    private readonly promptRegistry: PromptRegistryService,
  ) {
    this.logger.setContext(RagQueryRewriteService.name);
    this.model = new ChatOpenAI({
      temperature: 0,
      model: NodeConfigService.get('queryRewriteModelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
  }

  /** 执行查询改写，并在模型或解析失败时回退到原问题。 */
  async rewrite(params: {
    question: string;
    memory: RagMemoryMessage[];
    session: RagResolvedSession;
    topK?: number;
  }): Promise<RagQueryRewriteResult> {
    const originalQuestion = params.question.trim();
    try {
      const prompt = await this.promptRegistry.buildPrompt('rewrite', {
        question: originalQuestion,
        memory: this.promptRegistry.formatMemory(params.memory),
        formatInstructions: this.outputParser.getFormatInstructions(),
      });
      const response = await this.model.invoke(prompt);
      const modelOutput = await this.outputParser.parse(
        this.extractContentText(response.content),
      );
      const result = this.buildResult(originalQuestion, modelOutput);
      this.logRewriteResult(params.session, params.topK, result);

      return result;
    } catch (error) {
      const result: RagQueryRewriteResult = {
        originalQuestion,
        rewrittenQuestion: originalQuestion,
        usedRewrite: false,
        rewriteReason: this.buildFallbackRewriteReason(error),
        fallbackReason: error instanceof Error ? error.message : String(error),
      };
      this.logRewriteResult(params.session, params.topK, result);

      return result;
    }
  }

  /** 校验模型改写结果并标记是否实际采用新查询。 */
  private buildResult(
    originalQuestion: string,
    modelOutput: RagQueryRewriteModelOutput,
  ): RagQueryRewriteResult {
    const rewrittenQuestion = this.normalizeRewrittenQuestion(
      modelOutput.rewrittenQuestion,
    );
    const rewriteReason =
      modelOutput.rewriteReason.trim() || '模型未返回改写原因';

    if (!rewrittenQuestion) {
      return {
        originalQuestion,
        rewrittenQuestion: originalQuestion,
        usedRewrite: false,
        rewriteReason,
        fallbackReason: 'empty_rewrite',
      };
    }

    if (rewrittenQuestion === originalQuestion) {
      return {
        originalQuestion,
        rewrittenQuestion: originalQuestion,
        usedRewrite: false,
        rewriteReason,
        fallbackReason: 'unchanged',
      };
    }

    return {
      originalQuestion,
      rewrittenQuestion,
      usedRewrite: true,
      rewriteReason,
    };
  }

  /** 清理模型输出中的包装引号和说明性前缀。 */
  private normalizeRewrittenQuestion(value: string): string {
    return value
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '')
      .replace(/^改写后的查询[:：]\s*/u, '')
      .trim();
  }

  /** 根据异常特征生成可读的改写回退原因。 */
  private buildFallbackRewriteReason(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('Failed to parse') ||
      message.includes('invalid_type') ||
      message.includes('Expected')
    ) {
      return '查询改写结构化解析失败，回退原问题';
    }

    return '查询改写模型调用失败，回退原问题';
  }

  /** 记录查询改写是否生效及其回退信息。 */
  private logRewriteResult(
    session: RagResolvedSession,
    topK: number | undefined,
    result: RagQueryRewriteResult,
  ) {
    this.logger.info('RAG query rewrite completed', undefined, {
      stage: 'rag_query_rewrite',
      tenantCode: this.tenantContext.tenant,
      sessionKey: session.sessionKey,
      topK,
      usedRewrite: result.usedRewrite,
      rewriteReason: result.rewriteReason,
      fallbackReason: result.fallbackReason,
    });
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
        if (typeof item.content === 'string') return item.content;

        return '';
      })
      .join('');
  }
}
