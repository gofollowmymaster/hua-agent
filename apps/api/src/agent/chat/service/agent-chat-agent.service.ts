import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ToolMessage, type BaseMessage } from '@langchain/core/messages';
import {
  createDeepAgent,
  createHarnessProfile,
  registerHarnessProfile,
} from 'deepagents';
import { NodeConfigService } from '@src/config/node-config.service';
import { AgentChatToolService } from './agent-chat-tool.service';
import type {
  AgentChatAgentEvent,
  AgentChatToolCallRecord,
} from '../type/agent-chat.type';

type DeepAgentStreamChunk =
  | ['messages', [BaseMessage, Record<string, unknown>]]
  | ['tools', ToolStreamEvent];

type ToolStreamEvent = {
  event: 'on_tool_start' | 'on_tool_end' | 'on_tool_error' | 'on_tool_event';
  name: string;
  toolCallId?: string;
  input?: unknown;
  output?: unknown;
  error?: unknown;
};

const EXCLUDED_BUILTIN_TOOLS = [
  'ls',
  'read_file',
  'write_file',
  'edit_file',
  'glob',
  'grep',
  'execute',
  'task',
];

/** 封装 deepagents 运行时创建、模型配置和有序流事件适配。 */
@Injectable()
export class AgentChatAgentService {
  private readonly model: ChatOpenAI;
  private readonly agent: ReturnType<typeof createDeepAgent>;

  /** 初始化模型、harness profile 和编译后的 Deep Agent 单例。 */
  constructor(private readonly toolService: AgentChatToolService) {
    this.model = new ChatOpenAI({
      temperature: 0.5,
      model: NodeConfigService.get('modelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
    this.registerHarnessProfile();
    this.agent = createDeepAgent({
      model: this.model,
      tools: this.toolService.getTools(),
      systemPrompt: this.buildSystemPrompt(),
    });
  }

  /** 按顺序消费 deepagents 消息和工具事件，输出协议无关的 Agent 事件。 */
  async *stream(
    messages: BaseMessage[],
  ): AsyncGenerator<AgentChatAgentEvent, void, void> {
    const pendingToolInputs = new Map<string, Record<string, unknown>>();
    const toolCalls: AgentChatToolCallRecord[] = [];
    let answer = '';
    const graphStream = await this.agent.stream(
      { messages },
      { streamMode: ['messages', 'tools'] },
    );

    for await (const chunk of graphStream) {
      if (!Array.isArray(chunk)) continue;
      const [mode, data] = chunk as unknown as DeepAgentStreamChunk;
      if (mode === 'messages') {
        const [messageChunk] = data;
        this.collectToolArguments(messageChunk, pendingToolInputs);
        const reasoning = this.extractReasoningText(messageChunk);

        if (reasoning) {
          yield { type: 'reasoning_delta', delta: reasoning };
        }
        const text = this.extractContentText(messageChunk.content);
        if (!text) continue;
        answer += text;
        yield { type: 'text_delta', delta: text };
        continue;
      }

      if (data.event === 'on_tool_start') {
        const callId = data.toolCallId ?? data.name;
        const inputArgs = this.normalizeInput(data.input);
        const existing = pendingToolInputs.get(callId);
        const args =
          existing && Object.keys(existing).length > 0 ? existing : inputArgs;
        pendingToolInputs.set(callId, args);
        yield {
          type: 'tool_start',
          name: data.name,
          arguments: args,
        };
        continue;
      }

      if (data.event === 'on_tool_end' || data.event === 'on_tool_error') {
        const callId = data.toolCallId ?? data.name;
        const args = pendingToolInputs.get(callId) ?? {};
        pendingToolInputs.delete(callId);
        const result =
          data.event === 'on_tool_end'
            ? this.normalizeResult(data.output)
            : this.normalizeResult(data.error);
        toolCalls.push({ name: data.name, arguments: args, result });
        yield { type: 'tool_end', name: data.name, arguments: args, result };
      }
    }

    yield {
      type: 'done',
      answer,
      toolCalls,
    };
  }

  /** 隐藏 deepagents 内置文件系统和任务工具，只保留业务工具。 */
  private registerHarnessProfile() {
    const modelName = NodeConfigService.get('modelName');
    registerHarnessProfile(
      `openai:${modelName}`,
      createHarnessProfile({
        excludedTools: EXCLUDED_BUILTIN_TOOLS,
        generalPurposeSubagent: { enabled: false },
      }),
    );
  }

  /** 构造业务 Agent 系统提示词，约束工具使用和回答边界。 */
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
    if (!Array.isArray(content)) return '';

    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (!part || typeof part !== 'object') return '';

        const item = part as Record<string, unknown>;
        if (item.type === 'reasoning') return '';
        if (typeof item.text === 'string') return item.text;
        if (typeof item.content === 'string') return item.content;

        return '';
      })
      .join('');
  }

  /** 从模型附加字段或 reasoning 内容块中提取过程文本。 */
  private extractReasoningText(chunk: unknown): string {
    if (!chunk || typeof chunk !== 'object') return '';

    const value = chunk as Record<string, unknown>;
    const additionalKwargs = value.additional_kwargs;
    if (additionalKwargs && typeof additionalKwargs === 'object') {
      const reasoningContent = (additionalKwargs as Record<string, unknown>)
        .reasoning_content;
      if (typeof reasoningContent === 'string' && reasoningContent) {
        return reasoningContent;
      }
    }

    if (!Array.isArray(value.content)) return '';
    return value.content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const item = part as Record<string, unknown>;
        if (item.type !== 'reasoning') return '';
        if (typeof item.reasoning === 'string') return item.reasoning;
        return typeof item.text === 'string' ? item.text : '';
      })
      .join('');
  }

  /** 将工具输入归一化为可持久化的参数对象。 */
  private normalizeInput(input: unknown): Record<string, unknown> {
    if (typeof input === 'string') {
      try {
        return this.normalizeInput(JSON.parse(input));
      } catch {
        return {};
      }
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return {};
    }

    const record = input as Record<string, unknown>;
    if (
      record.args &&
      typeof record.args === 'object' &&
      !Array.isArray(record.args)
    ) {
      return this.normalizeInput(record.args);
    }
    if (
      record.kwargs &&
      typeof record.kwargs === 'object' &&
      !Array.isArray(record.kwargs)
    ) {
      return this.normalizeInput(record.kwargs);
    }
    if (
      record.input &&
      typeof record.input === 'object' &&
      !Array.isArray(record.input)
    ) {
      return this.normalizeInput(record.input);
    }
    return record;
  }

  /** 从消息流中的 tool_calls/tool_call_chunks 提前补齐工具入参。 */
  private collectToolArguments(
    messageChunk: BaseMessage,
    pendingToolInputs: Map<string, Record<string, unknown>>,
  ) {
    const chunk = messageChunk as unknown as {
      tool_calls?: Array<{ id?: string; args?: Record<string, unknown> }>;
      tool_call_chunks?: Array<{ id?: string; args?: string }>;
    };

    for (const call of chunk.tool_calls ?? []) {
      if (call.id && call.args && typeof call.args === 'object') {
        this.setPendingInput(
          pendingToolInputs,
          call.id,
          this.normalizeInput(call.args),
        );
      }
    }
    for (const call of chunk.tool_call_chunks ?? []) {
      if (call.id && typeof call.args === 'string' && call.args) {
        try {
          this.setPendingInput(
            pendingToolInputs,
            call.id,
            this.normalizeInput(JSON.parse(call.args)),
          );
        } catch {
          // 分片参数未完整时忽略，on_tool_start 会提供最终入参。
        }
      }
    }
  }

  /** 仅当尚未拿到有效入参时写入工具参数。 */
  private setPendingInput(
    pendingToolInputs: Map<string, Record<string, unknown>>,
    id: string,
    args: Record<string, unknown>,
  ) {
    const existing = pendingToolInputs.get(id);
    if (!existing || Object.keys(existing).length === 0) {
      pendingToolInputs.set(id, args);
    }
  }

  /** 将工具输出统一转换为字符串，并解包 LangChain ToolMessage。 */
  private normalizeResult(output: unknown): string {
    if (output instanceof ToolMessage) {
      return this.normalizeToolMessageContent(output.content);
    }
    if (output instanceof Error) return output.message;
    if (typeof output === 'string') return output;
    if (output && typeof output === 'object') {
      const content = this.extractSerializedContent(output);
      if (content !== undefined) {
        return this.normalizeToolMessageContent(content);
      }
    }
    try {
      return JSON.stringify(output ?? '');
    } catch {
      return String(output ?? '');
    }
  }

  /** 从 LangChain 序列化消息或普通对象中提取工具内容。 */
  private extractSerializedContent(output: unknown): unknown {
    if (!output || typeof output !== 'object') return undefined;
    const record = output as Record<string, unknown>;
    if ('content' in record) return record.content;
    if (record.kwargs && typeof record.kwargs === 'object') {
      const kwargs = record.kwargs as Record<string, unknown>;
      if ('content' in kwargs) return kwargs.content;
    }
    return undefined;
  }

  /** 将 ToolMessage 内容归一化为字符串。 */
  private normalizeToolMessageContent(content: unknown): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (
            part &&
            typeof part === 'object' &&
            'text' in part &&
            typeof (part as Record<string, unknown>).text === 'string'
          ) {
            return (part as Record<string, unknown>).text as string;
          }
          return '';
        })
        .join('');
    }
    if (content === undefined || content === null) return '';
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
}
