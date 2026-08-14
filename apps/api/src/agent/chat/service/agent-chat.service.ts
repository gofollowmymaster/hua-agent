import { Injectable, BadRequestException } from '@nestjs/common';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { createUIMessageStream } from 'ai';
import { randomUUID } from 'node:crypto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { AgentChatAgentService } from './agent-chat-agent.service';
import { AgentChatMemoryService } from './agent-chat-memory.service';
import type {
  AgentChatRequest,
  AgentChatToolCallRecord,
  AgentChatWriter,
} from '../type/agent-chat.type';

/** 编排业务 Agent 的请求解析、Deep Agents 运行和会话记忆持久化。 */
@Injectable()
export class AgentChatService {
  /** 注入 deepagents 运行时和会话记忆服务。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly memoryService: AgentChatMemoryService,
    private readonly agentService: AgentChatAgentService,
  ) {
    this.logger.setContext(AgentChatService.name);
  }

  /** 将 AGUI 聊天请求转换为 Deep Agents 流式响应。 */
  createChatStream(params: AgentChatRequest) {
    const question = this.extractLatestUserQuestion(params);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        const streamWriter = writer as AgentChatWriter;
        const session = this.memoryService.resolveSession({
          channel: 'agent-web',
          conversationId,
          conversationType: 'agent-chat',
          participantId,
          messageId: question.id,
          metadata: { source: 'agent-demo' },
        });

        streamWriter.write({
          type: 'data-status',
          data: { stage: 'analyze_start', message: '开始分析问题' },
        });

        const history = await this.memoryService.loadRecentMessages(
          session,
          10,
        );
        const messages: BaseMessage[] = [
          ...history.map((message) =>
            message.role === 'user'
              ? new HumanMessage(message.content)
              : new AIMessage(message.content),
          ),
          new HumanMessage(question.text),
        ];

        let answer = '';
        const toolCalls: AgentChatToolCallRecord[] = [];
        let textStarted = false;
        const reasoningId = randomUUID();
        let reasoningStarted = false;
        const startReasoning = () => {
          if (reasoningStarted) return;
          streamWriter.write({ type: 'reasoning-start', id: reasoningId });
          reasoningStarted = true;
        };
        const endReasoning = () => {
          if (!reasoningStarted) return;
          streamWriter.write({ type: 'reasoning-end', id: reasoningId });
          reasoningStarted = false;
        };
        const startText = () => {
          if (textStarted) return;
          endReasoning();
          streamWriter.write({
            type: 'data-status',
            data: { stage: 'generate_start', message: '开始生成答案' },
          });
          streamWriter.write({ type: 'text-start', id: textId });
          textStarted = true;
        };

        for await (const event of this.agentService.stream(messages)) {
          if (event.type === 'reasoning_delta') {
            startReasoning();
            streamWriter.write({
              type: 'reasoning-delta',
              id: reasoningId,
              delta: event.delta,
            });
            continue;
          }
          if (event.type === 'tool_start') {
            endReasoning();
            streamWriter.write({
              type: 'data-status',
              data: {
                stage: 'tool_call',
                message: `调用工具：${event.name}`,
                tool: event.name,
              },
            });
            continue;
          }
          if (event.type === 'tool_end') {
            const toolCall: AgentChatToolCallRecord = {
              name: event.name,
              arguments: event.arguments,
              result: event.result,
            };
            endReasoning();
            toolCalls.push(toolCall);
            streamWriter.write({
              type: 'data-status',
              data: this.buildToolResultStatus(toolCall),
            });
            continue;
          }
          if (event.type === 'text_delta') {
            answer += event.delta;
            startText();
            streamWriter.write({
              type: 'text-delta',
              id: textId,
              delta: event.delta,
            });
            continue;
          }
          if (event.type === 'done') {
            answer = event.answer;
            toolCalls.length = 0;
            toolCalls.push(...event.toolCalls);
          }
        }

        if (!answer) {
          answer = '抱歉，我暂时无法生成回答，请稍后重试。';
          startText();
          streamWriter.write({
            type: 'text-delta',
            id: textId,
            delta: answer,
          });
        }
        if (!textStarted) {
          startText();
          streamWriter.write({
            type: 'text-delta',
            id: textId,
            delta: answer,
          });
        }
        streamWriter.write({ type: 'text-end', id: textId });

        await this.memoryService.appendUserMessage(
          session,
          question.text,
          question.id,
        );
        await this.memoryService.appendAssistantMessage(
          session,
          answer,
          toolCalls,
        );

        streamWriter.write({
          type: 'data-status',
          data: { stage: 'done', message: '生成完成' },
        });
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }

  /** 将工具返回结果转换为过程区可展示的状态摘要。 */
  private buildToolResultStatus(
    toolCall: AgentChatToolCallRecord,
  ): Record<string, unknown> {
    return {
      stage: 'tool_result',
      tool: toolCall.name,
      message: this.buildToolResultMessage(toolCall),
      arguments: toolCall.arguments,
      result: toolCall.result,
    };
  }

  /** 为知识检索和文档切片工具生成摘要，其余工具回退到通用文案。 */
  private buildToolResultMessage(toolCall: AgentChatToolCallRecord): string {
    if (toolCall.name === 'search_knowledge') {
      return this.buildSearchKnowledgeSummary(toolCall.result);
    }
    if (toolCall.name === 'get_document') {
      return this.buildDocumentSummary(toolCall.result);
    }
    if (toolCall.name === 'get_document_chunks') {
      return this.buildDocumentChunksSummary(toolCall.result);
    }
    return `工具执行完成：${toolCall.name}`;
  }

  /** 格式化知识库检索命中摘要。 */
  private buildSearchKnowledgeSummary(result: string): string {
    const hits = this.parseJsonArray(result);
    if (!hits || hits.length === 0) return '未检索到相关文档';
    const names = hits
      .map((hit) => {
        const record =
          typeof hit === 'object' && hit
            ? (hit as Record<string, unknown>)
            : null;
        return record && typeof record.fileName === 'string'
          ? record.fileName
          : '';
      })
      .filter(Boolean);
    if (names.length === 0) {
      return `检索到 ${hits.length} 个相关文档`;
    }
    const visible = names.slice(0, 3).join('、');
    const suffix = hits.length > names.slice(0, 3).length ? ' 等' : '';
    return `检索到 ${hits.length} 个相关文档：${visible}${suffix}`;
  }

  /** 格式化文档详情工具摘要。 */
  private buildDocumentSummary(result: string): string {
    const document = this.parseJsonObject(result);
    if (
      document &&
      typeof document.fileName === 'string' &&
      document.fileName
    ) {
      return `已获取文档：${document.fileName}`;
    }
    return '已获取文档详情';
  }

  /** 格式化文档切片工具摘要。 */
  private buildDocumentChunksSummary(result: string): string {
    const data = this.parseJsonObject(result);
    if (!data) return '已获取文档切片';
    const list = Array.isArray(data.list) ? data.list : [];
    const total = typeof data.total === 'number' ? data.total : list.length;
    return `已获取 ${list.length}/${total} 个文档切片`;
  }

  /** 安全解析 JSON 数组，失败返回 null。 */
  private parseJsonArray(result: string): unknown[] | null {
    try {
      const value = JSON.parse(result);
      return Array.isArray(value) ? value : null;
    } catch {
      console.log('[ parseJsonArray result ] >', result);
      return null;
    }
  }

  /** 安全解析 JSON 对象，失败返回 null。 */
  private parseJsonObject(result: string): Record<string, unknown> | null {
    try {
      const value = JSON.parse(result);
      return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
    } catch {
      console.log('[ parseJsonObject result ] >', result);

      return null;
    }
  }

  /** 从 AGUI 消息中提取最近一条有效用户文本问题。 */
  private extractLatestUserQuestion(params: AgentChatRequest) {
    if (!Array.isArray(params?.messages) || params.messages.length === 0) {
      throw new BadRequestException('messages is required');
    }

    const latestUserMessage = [...params.messages]
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

    return { id: latestUserMessage?.id, text: question };
  }
}
