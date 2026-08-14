import type { Chat } from '@ai-sdk/vue';
import type { UIMessage } from 'ai';

export interface ChatDemoPageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChatDemoSessionItem {
  id: string | number;
  conversationId?: string;
  latestMessage?: {
    role: string;
    content: string;
    createdAt: string;
  };
  messageCount: number;
  lastActiveAt: string;
}

export interface ChatDemoMessageItem {
  id: string | number;
  role: string;
  content: string;
  createdAt: string;
  toolCalls?: unknown;
}

export interface ChatDemoStatusData {
  stage?: string;
  message?: string;
  tool?: string;
  chunks?: number;
  arguments?: Record<string, unknown>;
  result?: string;
  [key: string]: unknown;
}

export type ChatDemoMessage = UIMessage<unknown, {
  status?: ChatDemoStatusData;
}>;

export interface ChatDemoAdapter {
  chatApi: string;
  channel: string;
  conversationType: string;
  getParticipantId(): string;
  createSession(id: string, participantId: string): Chat<ChatDemoMessage>;
  pageSessions(
    params: Record<string, unknown>,
  ): Promise<ChatDemoPageResult<ChatDemoSessionItem>>;
  listMessages(
    id: string | number,
  ): Promise<ChatDemoMessageItem[]>;
  toUiMessages(messages: ChatDemoMessageItem[]): ChatDemoMessage[];
  formatStatus(data: unknown): string;
  formatTime?(value?: string): string;
  onMarkdownClick?(event: MouseEvent): void;
}

export interface ChatDemoOptions {
  assistantName?: string;
  userLabel?: string;
  historyTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
