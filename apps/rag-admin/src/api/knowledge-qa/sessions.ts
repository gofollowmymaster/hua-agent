import { get, post } from '../common/http';
import { normalizeGridPageParams } from '../common/types';
import type { GridPageResult, PageResult } from '../common/types';

export interface RagSessionItem {
  id: string | number;
  channel: string;
  sessionKey: string;
  userId?: string;
  conversationId?: string;
  conversationType?: string;
  messageCount: number;
  latestMessage?: {
    role: string;
    content: string;
    createdAt: string;
  };
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
    params,
  );
}

export async function pageSessionsGrid(params: Record<string, unknown>) {
  const result = await pageSessions(normalizeGridPageParams(params));
  return {
    records: result.list,
    total: result.total,
  } satisfies GridPageResult<RagSessionItem>;
}

export function listSessionMessages(id: string | number) {
  return get<RagMessageItem[]>(`/ai/rag/admin/sessions/${id}/messages`);
}
