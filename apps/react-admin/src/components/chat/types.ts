import type { UIMessage } from 'ai';
import type { DefaultChatTransport } from 'ai';
import type { PageResult } from '@/api/common/types';

export interface ChatSessionItem {
  id: string | number;
  conversationId?: string;
  latestMessage?: { role: string; content: string; createdAt: string };
  messageCount: number;
  lastActiveAt: string;
}

export interface ChatDemoAdapter {
  channel: string;
  conversationType: string;
  createTransport(participantId: string): DefaultChatTransport<UIMessage>;
  pageSessions(
    params: Record<string, unknown>,
  ): Promise<PageResult<ChatSessionItem>>;
  listMessages(id: string | number): Promise<unknown[]>;
  toUiMessages(messages: unknown[]): UIMessage[];
  formatStatus(data: unknown): string;
  formatTime(value?: string): string;
  resolvePreview?(
    href: string,
    label: string,
  ): {
    id: string;
    fileName: string;
    fileType: string;
  } | null;
}
