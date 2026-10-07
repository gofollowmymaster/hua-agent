import type { DefaultChatTransport, UIMessage } from 'ai';

export interface ChatPageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChatSessionItem {
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

export interface ChatStatusData {
  stage?: string;
  message?: string;
  tool?: string;
  chunks?: number;
  arguments?: unknown;
  result?: unknown;
  [key: string]: unknown;
}

export interface ChatReferenceItem {
  id: string;
  fileName: string;
  fileType: string;
}

export interface ChatAdapter {
  channel: string;
  conversationType: string;
  createTransport(participantId: string): DefaultChatTransport<UIMessage>;
  pageSessions(
    params: Record<string, unknown>,
  ): Promise<ChatPageResult<ChatSessionItem>>;
  listMessages(id: string | number): Promise<unknown[]>;
  toUiMessages(messages: unknown[]): UIMessage[];
  formatStatus(data: unknown): string;
  formatTime(value?: string): string;
  resolvePreview?(href: string, label: string): ChatReferenceItem | null;
}

export interface ChatWorkspaceProps {
  adapter: ChatAdapter;
  participantId: string;
  assistantName?: string;
  userName?: string;
  historyTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onPreview?: (item: ChatReferenceItem) => void;
}
