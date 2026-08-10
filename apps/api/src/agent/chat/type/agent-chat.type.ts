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
