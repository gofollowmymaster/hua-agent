import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import type { BaseMessage } from '@langchain/core/messages';
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
        const text = this.extractContentText(messageChunk.content);
        if (!text) continue;
        answer += text;
        yield { type: 'text_delta', delta: text };
        continue;
      }

      if (data.event === 'on_tool_start') {
        const callId = data.toolCallId ?? data.name;
        pendingToolInputs.set(callId, this.normalizeInput(data.input));
        yield {
          type: 'tool_start',
          name: data.name,
          arguments: this.normalizeInput(data.input),
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

  /** 将工具输入归一化为可持久化的参数对象。 */
  private normalizeInput(input: unknown): Record<string, unknown> {
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      return input as Record<string, unknown>;
    }
    return {};
  }

  /** 将工具输出统一转换为字符串，供会话消息持久化。 */
  private normalizeResult(output: unknown): string {
    if (output instanceof Error) return output.message;
    if (typeof output === 'string') return output;
    try {
      return JSON.stringify(output ?? '');
    } catch {
      return String(output ?? '');
    }
  }
}
