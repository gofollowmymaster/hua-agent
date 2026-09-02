import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ToolMessage, type BaseMessage } from '@langchain/core/messages';
import {
  createDeepAgent,
  createHarnessProfile,
  registerHarnessProfile,
} from 'deepagents';
import { NodeConfigService } from '@src/config/node-config.service';
import { AsyncEventQueue } from '../common/async-event-queue';
import { AgentChatToolService } from './agent-chat-tool.service';
import type {
  AgentChatAgentEvent,
  AgentChatToolCallRecord,
} from '../type/agent-chat-contract.type';
import type {
  AgentMessageStream,
  AgentToolCallStream,
} from '../type/agent-chat-runtime.type';

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
    const toolCalls: AgentChatToolCallRecord[] = [];
    let answer = '';
    const run = await this.agent.streamEvents({ messages }, { version: 'v3' });
    const events = new AsyncEventQueue<AgentChatAgentEvent>();

    void Promise.all([
      this.consumeMessageStreams(run.messages, events),
      this.consumeToolCalls(run.toolCalls, toolCalls, events),
    ])
      .then(() => events.close())
      .catch((error) => events.fail(error));

    for await (const event of events) {
      if (event.type === 'text_delta') {
        answer += event.delta;
      }
      yield event;
    }

    yield {
      type: 'done',
      answer,
      toolCalls,
    };
  }

  /** 将模型文本和 reasoning 投影映射为界面可消费的流事件。 */
  private async consumeMessageStreams(
    messages: AsyncIterable<AgentMessageStream>,
    events: AsyncEventQueue<AgentChatAgentEvent>,
  ) {
    for await (const message of messages) {
      await Promise.all([
        this.forwardDeltas(message.reasoning, 'reasoning_delta', events),
        this.forwardDeltas(message.text, 'text_delta', events),
      ]);
    }
  }

  /** 将工具调用投影映射为开始和完成事件，并保留原始结果。 */
  private async consumeToolCalls(
    calls: AsyncIterable<AgentToolCallStream>,
    toolCalls: AgentChatToolCallRecord[],
    events: AsyncEventQueue<AgentChatAgentEvent>,
  ) {
    for await (const call of calls) {
      const argumentsValue = this.normalizeInput(call.input);
      events.push({
        type: 'tool_start',
        name: call.name,
        arguments: argumentsValue,
      });

      const [status, outputResult, error] = await Promise.all([
        call.status,
        call.output.then(
          (value) => ({ value }),
          (outputError) => ({ outputError }),
        ),
        call.error,
      ]);
      const output =
        'outputError' in outputResult
          ? outputResult.outputError
          : outputResult.value;
      const result =
        status === 'error'
          ? (error ?? this.normalizeResult(output))
          : this.normalizeResult(output);
      const toolCall = {
        name: call.name,
        arguments: argumentsValue,
        result,
      };
      toolCalls.push(toolCall);
      events.push({ type: 'tool_end', ...toolCall });
    }
  }

  /** 转发单个模型文本投影中的非空增量。 */
  private async forwardDeltas(
    deltas: AsyncIterable<string>,
    type: 'reasoning_delta' | 'text_delta',
    events: AsyncEventQueue<AgentChatAgentEvent>,
  ) {
    for await (const delta of deltas) {
      if (delta) events.push({ type, delta });
    }
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
5. 工具结果不足时明确说明资料未覆盖，不猜测。
6. 当系统输出用户可见的思考过程时，仅使用简体中文。`;
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
