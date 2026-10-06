import { get, post } from '../common/http';
import { normalizePageParams, type PageResult } from '../common/types';

export interface AgentChatSessionItem {
  id: string | number;
  conversationId?: string;
  latestMessage?: { role: string; content: string; createdAt: string };
  messageCount: number;
  lastActiveAt: string;
}

export type AgentChatMessagePart =
  | { type: 'reasoning'; text: string }
  | { type: 'text'; text: string }
  | { type: 'data-status'; data: Record<string, unknown> };

export interface AgentChatMessageItem {
  id: string | number;
  role: string;
  content: string;
  toolCalls?: unknown;
  parts?: AgentChatMessagePart[];
  createdAt: string;
}

export function pageAgentChatSessions(params: Record<string, unknown>) {
  return post<PageResult<AgentChatSessionItem>>(
    '/agent/chat/sessions/page',
    normalizePageParams(params),
  );
}
export function listAgentChatMessages(id: string | number) {
  return get<AgentChatMessageItem[]>(`/agent/chat/sessions/${id}/messages`);
}
