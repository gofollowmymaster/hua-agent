import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ToolMessage, type BaseMessage } from '@langchain/core/messages';
import { toolCallLimitMiddleware } from 'langchain';
import {
  createDeepAgent,
  createHarnessProfile,
  registerHarnessProfile,
} from 'deepagents';
import { NodeConfigService } from '@src/config/node-config.service';
import { AgentChatToolLoggingMiddlewareService } from './agent-chat-tool-logging-middleware.service';
import { AgentChatToolService } from './agent-chat-tool.service';
import type {
  AgentChatAgentEvent,
  AgentChatExecutionContext,
  AgentChatToolCallRecord,
} from '../type/agent-chat-contract.type';

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

const MAX_TOOL_CALLS_PER_RUN = 5;
const MISSING_TOOL_OUTPUT_MESSAGE = '工具执行完成，但未返回可展示结果';

type MessageProtocolData = {
  event: string;
  delta?:
    | { type: 'reasoning-delta'; reasoning: string }
    | { type: 'text-delta'; text: string };
};

type ToolProtocolData =
  | {
      event: 'tool-started';
      tool_call_id: string;
      tool_name: string;
      input?: unknown;
    }
  | { event: 'tool-finished'; tool_call_id: string; output?: unknown }
  | { event: 'tool-error'; tool_call_id: string; message: string };

/** 封装 deepagents 运行时创建、模型配置和有序流事件适配。 */
@Injectable()
export class AgentChatAgentService {
  private readonly model: ChatOpenAI;
  private readonly agent: ReturnType<typeof createDeepAgent>;

  /** 初始化模型、harness profile 和编译后的 Deep Agent 单例。 */
  constructor(
    private readonly toolService: AgentChatToolService,
    private readonly toolLoggingMiddleware: AgentChatToolLoggingMiddlewareService,
  ) {
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
      middleware: [
        toolCallLimitMiddleware({
          runLimit: MAX_TOOL_CALLS_PER_RUN,
          exitBehavior: 'continue',
        }),
        this.toolLoggingMiddleware.create(),
      ],
    });
  }

  /** 按 v3 原始事件到达顺序输出协议无关的 Agent 事件。 */
  async *stream(
    messages: BaseMessage[],
    context: AgentChatExecutionContext,
  ): AsyncGenerator<AgentChatAgentEvent, void, void> {
    const toolCalls: AgentChatToolCallRecord[] = [];
    let answer = '';
    const run = await this.agent.streamEvents(
      { messages },
      { version: 'v3', context },
    );
    const activeToolCalls = new Map<
      string,
      Omit<AgentChatToolCallRecord, 'result'>
    >();

    for await (const event of run) {
      if (event.method === 'messages') {
        const data = event.params.data as MessageProtocolData;
        if (data.event !== 'content-block-delta' || !data.delta) continue;

        if (data.delta.type === 'reasoning-delta') {
          if (data.delta.reasoning) {
            yield {
              type: 'reasoning_delta',
              delta: data.delta.reasoning,
            };
          }
          continue;
        }
        if (data.delta.type === 'text-delta' && data.delta.text) {
          answer += data.delta.text;
          yield { type: 'text_delta', delta: data.delta.text };
        }
        continue;
      }

      if (event.method !== 'tools') continue;
      const data = event.params.data as ToolProtocolData;
      if (data.event === 'tool-started') {
        const toolCall = {
          name: data.tool_name,
          arguments: this.normalizeInput(data.input),
        };
        activeToolCalls.set(data.tool_call_id, toolCall);
        yield { type: 'tool_start', ...toolCall };
        continue;
      }

      if (data.event === 'tool-finished') {
        const toolCall = this.finishToolCall(
          data.tool_call_id,
          data.output === undefined
            ? MISSING_TOOL_OUTPUT_MESSAGE
            : this.normalizeResult(data.output),
          activeToolCalls,
        );
        toolCalls.push(toolCall);
        yield { type: 'tool_end', ...toolCall };
        continue;
      }

      if (data.event === 'tool-error') {
        const toolCall = this.finishToolCall(
          data.tool_call_id,
          data.message,
          activeToolCalls,
        );
        toolCalls.push(toolCall);
        yield { type: 'tool_end', ...toolCall };
      }
    }

    await run.output;
    yield {
      type: 'done',
      answer,
      toolCalls,
    };
  }

  /** 通过工具调用 ID 关联开始事件，并生成可持久化的结束记录。 */
  private finishToolCall(
    toolCallId: string,
    result: string,
    activeToolCalls: Map<string, Omit<AgentChatToolCallRecord, 'result'>>,
  ): AgentChatToolCallRecord {
    const toolCall = activeToolCalls.get(toolCallId) ?? {
      name: 'unknown_tool',
      arguments: {},
    };
    activeToolCalls.delete(toolCallId);
    return { ...toolCall, result };
  }

  /** 隐藏 deepagents 内置文件系统和任务工具，只保留业务工具。 */
  private registerHarnessProfile() {
    registerHarnessProfile(
      'openai',
      createHarnessProfile({
        excludedTools: EXCLUDED_BUILTIN_TOOLS,
        generalPurposeSubagent: { enabled: false },
      }),
    );
  }

  /** 构造业务 Agent 系统提示词，约束工具使用和回答边界。 */
  private buildSystemPrompt() {
    return `你是业务 Agent 助手，可以调用工具获取业务知识库内容、文档详情、一件代发订单、当前时间和计算结果。
规则：
1. 业务问题优先调用 search_knowledge，必要时调用 get_document  查看详情。
2. 只基于工具返回的资料回答，不编造业务事实。
3. 引用资料时给出文档名或路径。
4. 用户询问时间时调用 get_current_time，需要计算时调用 calculate。
5. 用户询问一件代发订单时，按需调用 list_ds_orders、get_ds_order 或 list_ds_order_logs。
6. 只有用户明确要求审核或取消指定订单时，才能调用 audit_ds_order 或 cancel_ds_order；仅查询状态时不得执行写操作。
7. 工具结果不足时明确说明资料未覆盖，不猜测。
8. 当系统输出用户可见的思考过程时，仅使用简体中文。
9. 只能使用 SDK 提供的原生工具调用，不得用 XML、Markdown 或文本模拟工具调用。`;
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
