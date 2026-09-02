import type { DynamicStructuredTool } from '@langchain/core/tools';

export type AgentMessageStream = {
  text: AsyncIterable<string>;
  reasoning: AsyncIterable<string>;
};

export type AgentToolCallStream = {
  name: string;
  input: unknown;
  output: Promise<unknown>;
  status: Promise<'running' | 'finished' | 'error'>;
  error: Promise<string | undefined>;
};

export type AgentChatTool = DynamicStructuredTool<any, any, any, string>;
