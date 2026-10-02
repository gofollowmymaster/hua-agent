import { Injectable } from '@nestjs/common';
import { ToolMessage } from '@langchain/core/messages';
import { createMiddleware } from 'langchain';
import { LoggerService } from '@src/common/service/logger/logger.service';
import type { AgentChatExecutionContext } from '../type/agent-chat-contract.type';

const COMPONENT_NAME = 'AgentChatToolLoggingMiddleware';

/** 为业务 Agent 的真实工具执行提供安全的结构化观测日志。 */
@Injectable()
export class AgentChatToolLoggingMiddlewareService {
  constructor(private readonly logger: LoggerService) {}

  /** 创建在工具执行前后记录状态、耗时和非敏感摘要的 Agent middleware。 */
  create() {
    return createMiddleware({
      name: COMPONENT_NAME,
      wrapToolCall: async (request, handler) => {
        const context = request.runtime.context as AgentChatExecutionContext;
        const metadata = this.buildMetadata(
          context,
          request.toolCall.name,
          request.toolCall.id,
        );
        const startedAt = performance.now();
        this.logger.info('Business Agent tool call started', undefined, {
          event: 'business_agent_tool_call_started',
          ...metadata,
          argumentKeys: Object.keys(request.toolCall.args ?? {}),
        });

        try {
          const result = await handler(request);
          const summary = this.summarizeResult(result);
          const durationMs = this.durationMs(startedAt);
          const level = summary.status === 'error' ? 'error' : 'info';

          this.logger[level](
            summary.status === 'error'
              ? 'Business Agent tool call failed'
              : 'Business Agent tool call completed',
            undefined,
            {
              event:
                summary.status === 'error'
                  ? 'business_agent_tool_call_failed'
                  : 'business_agent_tool_call_completed',
              ...metadata,
              durationMs,
              ...summary,
            },
          );
          return result;
        } catch (error) {
          this.logger.error('Business Agent tool call failed', undefined, {
            event: 'business_agent_tool_call_failed',
            ...metadata,
            durationMs: this.durationMs(startedAt),
            errorName: error instanceof Error ? error.name : typeof error,
            errorCode: this.extractErrorCode(error),
          });
          throw error;
        }
      },
    });
  }

  /** 提取可关联调用但不包含用户内容的日志元数据。 */
  private buildMetadata(
    context: AgentChatExecutionContext,
    toolName: string,
    toolCallId: string | undefined,
  ) {
    return {
      component: COMPONENT_NAME,
      toolName,
      toolCallId,
      tenantCode: context.tenantCode,
      channel: context.channel,
      conversationId: context.conversationId,
      sessionKey: context.sessionKey,
    };
  }

  /** 仅从工具响应中提取类型、长度和 JSON 结构计数。 */
  private summarizeResult(result: unknown) {
    if (!(result instanceof ToolMessage)) {
      return { status: 'success', resultType: typeof result };
    }

    const content = this.normalizeContent(result.content);
    const parsed = this.parseJson(content);
    const list = this.extractList(parsed);
    const total = this.extractTotal(parsed);
    return {
      status: result.status === 'error' ? 'error' : 'success',
      resultType: 'ToolMessage',
      resultCharacters: content.length,
      ...(list ? { resultItemCount: list.length } : {}),
      ...(total !== undefined ? { resultTotal: total } : {}),
    };
  }

  /** 将工具消息内容转为仅用于长度与结构统计的字符串。 */
  private normalizeContent(content: unknown) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (
            item &&
            typeof item === 'object' &&
            'text' in item &&
            typeof (item as Record<string, unknown>).text === 'string'
          ) {
            return (item as Record<string, unknown>).text as string;
          }
          return '';
        })
        .join('');
    }
    return '';
  }

  /** 安全解析 JSON 响应以提取条目数，不保留或输出原始内容。 */
  private parseJson(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }

  /** 返回数组响应或分页响应的列表字段。 */
  private extractList(value: unknown): unknown[] | undefined {
    if (Array.isArray(value)) return value;
    if (
      value &&
      typeof value === 'object' &&
      Array.isArray((value as Record<string, unknown>).list)
    ) {
      return (value as Record<string, unknown>).list as unknown[];
    }
    return undefined;
  }

  /** 返回分页响应中的总数。 */
  private extractTotal(value: unknown): number | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const total = (value as Record<string, unknown>).total;
    return typeof total === 'number' ? total : undefined;
  }

  /** 将高精度开始时间转换为毫秒耗时。 */
  private durationMs(startedAt: number) {
    return Number((performance.now() - startedAt).toFixed(2));
  }

  /** 从结构化异常中提取稳定错误码，不记录异常正文。 */
  private extractErrorCode(error: unknown): string | number | undefined {
    if (!error || typeof error !== 'object') return undefined;
    const code = (error as Record<string, unknown>).code;
    return typeof code === 'string' || typeof code === 'number'
      ? code
      : undefined;
  }
}
