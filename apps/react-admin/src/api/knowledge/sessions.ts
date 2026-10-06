import { get, post } from '../common/http';
import { normalizePageParams, type PageResult } from '../common/types';

export interface RagSessionItem {
  id: string | number;
  channel: string;
  sessionKey: string;
  userId?: string;
  conversationId?: string;
  conversationType?: string;
  messageCount: number;
  latestMessage?: { role: string; content: string; createdAt: string };
  lastActiveAt: string;
  createdAt: string;
}

export interface RagMessageItem {
  id: string | number;
  role: string;
  content: string;
  senderId?: string;
  externalMessageId?: string;
  replyToMessageId?: string;
  createdAt: string;
}

export function pageSessions(params: Record<string, unknown>) {
  return post<PageResult<RagSessionItem>>(
    '/ai/rag/admin/sessions/page',
    normalizePageParams(params),
  );
}
export function listSessionMessages(id: string | number) {
  return get<RagMessageItem[]>(`/ai/rag/admin/sessions/${id}/messages`);
}
