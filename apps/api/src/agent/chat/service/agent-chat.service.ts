import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { createUIMessageStream } from 'ai';
import { randomUUID } from 'node:crypto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { AgentChatMemoryService } from './agent-chat-memory.service';
import { AgentChatToolService } from './agent-chat-tool.service';
import type {
  AgentChatRequest,
  AgentChatToolCallRecord,
} from '../type/agent-chat.type';

type AgentChatWriter = {
  write: (
    part:
      | { type: 'data-status'; data: Record<string, unknown> }
      | { type: 'text-start'; id: string }
      | { type: 'text-delta'; id: string; delta: string }
      | { type: 'text-end'; id: string },
  ) => void;
};

/** 编排业务 Agent 的多工具对话、知识检索和流式回答。 */
@Injectable()
export class AgentChatService {
  private readonly model: ChatOpenAI;

  /** 初始化对话模型，并注入会话记忆和工具服务。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly memoryService: AgentChatMemoryService,
    private readonly toolService: AgentChatToolService,
  ) {
    this.logger.setContext(AgentChatService.name);
    this.model = new ChatOpenAI({
      temperature: 0,
      model: NodeConfigService.get('modelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
  }

  /** 将 AGUI 聊天请求转换为多工具 Agent 流式响应。 */
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
          new SystemMessage(this.buildSystemPrompt()),
          ...history.map((message) =>
            message.role === 'user'
              ? new HumanMessage(message.content)
              : new AIMessage(message.content),
          ),
          new HumanMessage(question.text),
        ];

        const { answer, toolCalls } = await this.runToolLoop(
          messages,
          streamWriter,
          textId,
        );

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

  /** 执行最多 3 轮工具调用，并流式生成最终答案。 */
  private async runToolLoop(
    messages: BaseMessage[],
    writer: AgentChatWriter,
    textId: string,
  ) {
    const tools = this.toolService.getTools();
    const modelWithTools = this.model.bindTools(tools);
    const toolCalls: AgentChatToolCallRecord[] = [];

    for (let round = 0; round < 3; round += 1) {
      const response = await modelWithTools.invoke(messages);
      messages.push(response);
      const calls = response.tool_calls ?? [];
      if (calls.length === 0) break;

      for (let index = 0; index < calls.length; index += 1) {
        const call = calls[index];
        const name = call.name;
        const args = (call.args ?? {}) as Record<string, unknown>;
        writer.write({
          type: 'data-status',
          data: {
            stage: 'tool_call',
            message: `调用工具：${name}`,
            tool: name,
          },
        });
        const result = await this.toolService.execute(name, args);
        toolCalls.push({ name, arguments: args, result });
        messages.push(
          new ToolMessage({
            content: result,
            tool_call_id: call.id ?? `tool-${round}-${index}`,
            name,
          }),
        );
      }
    }

    writer.write({
      type: 'data-status',
      data: { stage: 'generate_start', message: '开始生成答案' },
    });
    const answer = await this.streamAnswer(messages, writer, textId);
    return { answer, toolCalls };
  }

  /** 流式调用普通模型生成最终答案，空结果时回退一次同步调用。 */
  private async streamAnswer(
    messages: BaseMessage[],
    writer: AgentChatWriter,
    textId: string,
  ) {
    let answer = '';
    let textStarted = false;
    const startText = () => {
      if (!textStarted) {
        writer.write({ type: 'text-start', id: textId });
        textStarted = true;
      }
    };

    try {
      const stream = await this.model.stream(messages);
      for await (const chunk of stream) {
        const text = this.extractContentText(chunk.content);
        if (!text) continue;
        answer += text;
        startText();
        writer.write({ type: 'text-delta', id: textId, delta: text });
      }
    } catch (error) {
      this.logger.warn(
        'Agent chat stream failed, fallback to invoke',
        undefined,
        {
          stage: 'agent_chat_stream_fallback',
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }

    if (!answer) {
      const response = await this.model.invoke(messages);
      answer = this.extractContentText(response.content);
      if (answer) {
        startText();
        writer.write({ type: 'text-delta', id: textId, delta: answer });
      }
    }

    if (!answer) {
      answer = '抱歉，我暂时无法生成回答，请稍后重试。';
      startText();
      writer.write({ type: 'text-delta', id: textId, delta: answer });
    }

    writer.write({ type: 'text-end', id: textId });
    return answer;
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

  /** 构造 Agent 系统提示词，约束工具使用和回答边界。 */
  private buildSystemPrompt() {
    return `你是业务 Agent 助手，可以调用工具获取业务知识库内容、文档详情、切片、当前时间和计算结果。
规则：
1. 业务问题优先调用 search_knowledge，必要时调用 get_document / get_document_chunks 查看详情。
2. 只基于工具返回的资料回答，不编造业务事实。
3. 引用资料时给出文档名或路径。
4. 用户询问时间时调用 get_current_time，需要计算时调用 calculate。
5. 工具结果不足时明确说明资料未覆盖，不猜测。`;
  }

  /** 将模型内容统一提取为纯文本。 */
  private extractContentText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (
            part &&
            typeof part === 'object' &&
            'text' in part &&
            typeof part.text === 'string'
          ) {
            return part.text;
          }
          return '';
        })
        .join('');
    }
    return String(content ?? '');
  }
}
