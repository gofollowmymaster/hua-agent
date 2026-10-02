import { get, post } from '../common/http';
import type { PageResult } from '../common/types';

export interface AgentChatSessionItem {
  id: string | number;
  tenantCode: string;
  channel: string;
  sessionKey: string;
  userId?: string;
  conversationId?: string;
  conversationType?: string;
  metadata: Record<string, unknown>;
  messageCount: number;
  latestMessage?: {
    id: string | number;
    role: string;
    content: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface AgentChatMessageItem {
  id: string | number;
  tenantCode: string;
  sessionId: string | number;
  role: string;
  content: string;
  toolCalls?: unknown;
  parts?: AgentChatMessagePart[];
  senderId?: string;
  externalMessageId?: string;
  replyToMessageId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type AgentChatMessagePart =
  | { type: 'reasoning'; text: string }
  | { type: 'text'; text: string }
  | {
      type: 'data-status';
      data: Record<string, unknown>;
    };

export const agentChatApiUrl = `${
  import.meta.env.VITE_API_BASE_URL || ''
}/agent/chat`;

export function pageAgentChatSessions(params: Record<string, unknown>) {
  return post<PageResult<AgentChatSessionItem>>(
    '/agent/chat/sessions/page',
    params,
  );
}

export function listAgentChatMessages(id: string | number) {
  return get<AgentChatMessageItem[]>(`/agent/chat/sessions/${id}/messages`);
}
