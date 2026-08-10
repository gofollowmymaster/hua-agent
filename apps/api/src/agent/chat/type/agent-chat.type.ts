import type { UIMessage } from 'ai';

export interface AgentChatRequest {
  id?: string;
  messages?: UIMessage[];
  participantId?: string;
}

export interface AgentChatSessionInput {
  channel?: string;
  conversationId?: string;
  conversationType?: string;
  participantId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentChatResolvedSession extends AgentChatSessionInput {
  tenantCode: string;
  channel: string;
  sessionKey: string;
}

export interface AgentChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentChatToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  result: string;
}

export type AgentChatAgentEvent =
  | {
      type: 'tool_start';
      name: string;
      arguments: Record<string, unknown>;
    }
  | {
      type: 'tool_end';
      name: string;
      arguments: Record<string, unknown>;
      result: string;
    }
  | { type: 'text_delta'; delta: string }
  | { type: 'done'; answer: string; toolCalls: AgentChatToolCallRecord[] };

export type AgentChatWriter = {
  write: (
    part:
      | { type: 'data-status'; data: Record<string, unknown> }
      | { type: 'text-start'; id: string }
      | { type: 'text-delta'; id: string; delta: string }
      | { type: 'text-end'; id: string },
  ) => void;
};
