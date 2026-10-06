import dayjs from 'dayjs';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { apiBaseUrl, createUnauthorizedFetch } from '@/api/common/http';
import {
  listSessionMessages,
  pageSessions,
  type RagMessageItem,
} from '@/api/knowledge/sessions';
import { currentAccessToken } from '@/auth/storage';
import type { ChatDemoAdapter } from '@/components/chat/types';

export function createRagChatAdapter(): ChatDemoAdapter {
  return {
    channel: 'web',
    conversationType: 'rag-chat',
    createTransport(participantId) {
      return new DefaultChatTransport({
        api: `${apiBaseUrl}/ai/rag/chat`,
        fetch: createUnauthorizedFetch(),
        headers: () => {
          const token = currentAccessToken();
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          return headers;
        },
        body: () => ({ participantId }),
      });
    },
    pageSessions,
    listMessages: (id) => listSessionMessages(id),
    toUiMessages: (messages) => toRagUiMessages(messages as RagMessageItem[]),
    formatStatus,
    formatTime: (value) => (value ? dayjs(value).format('MM-DD HH:mm') : '-'),
    resolvePreview: resolvePreviewDocument,
  };
}

export function toRagUiMessages(messages: RagMessageItem[]): UIMessage[] {
  return messages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant',
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text', text: message.content }],
    }));
}

export function resolvePreviewDocument(href: string, label: string) {
  const match = href.match(
    /^\/(?:api\/)?ai\/rag\/admin\/documents\/([^/]+)\/preview$/,
  );
  if (!match) return null;
  const fileName = label.trim() || '引用文件';
  const extension = fileName.split('.').pop()?.toLowerCase();
  return {
    id: decodeURIComponent(match[1]),
    fileName,
    fileType:
      extension && extension !== fileName.toLowerCase() ? extension : '',
  };
}

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';
  const status = data as {
    stage?: string;
    message?: string;
    chunks?: number;
  };
  return status.chunks != null
    ? `${status.message || '状态更新'} · ${status.chunks} 个片段`
    : status.message || status.stage || '状态更新';
}
