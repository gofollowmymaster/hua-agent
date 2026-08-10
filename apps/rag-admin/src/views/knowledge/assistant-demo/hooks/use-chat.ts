import dayjs from 'dayjs';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { getToken } from '@/stores/modules/user/token';
import { useUserStore } from '@/stores/modules/user';
import type { RagMessageItem } from '@/api/rag-admin';

export interface RagStatusData {
  stage?: string;
  message?: string;
  chunks?: number;
}

export interface RagAssistantDataParts {
  status: RagStatusData;
  [key: string]: unknown;
}

export type RagAssistantMessage = UIMessage<unknown, RagAssistantDataParts>;

export interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export function createChatSession(id: string, participantId: string) {
  const userStore = useUserStore();

  return new Chat<RagAssistantMessage>({
    id,
    transport: new DefaultChatTransport({
      api: `${apiBaseUrl}/ai/rag/chat`,
      headers: () => {
        const token = userStore.token || getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        return headers;
      },
      body: () => ({
        participantId,
      }),
    }),
  });
}

export function toUiMessages(
  historyMessages: RagMessageItem[],
): RagAssistantMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant',
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text', text: message.content }],
    }));
}

export function createLocalChatId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `rag-chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';

  const statusData = data as RagStatusData;
  if (statusData.chunks != null) {
    return `${statusData.message || '状态更新'} · ${statusData.chunks} 个片段`;
  }
  return statusData.message || statusData.stage || '状态更新';
}

export function resolvePreviewDocument(segment: {
  href: string;
  label: string;
}) {
  const match = segment.href.match(
    /^\/(?:api\/)?ai\/rag\/admin\/documents\/([^/]+)\/preview$/,
  );
  if (!match) return null;

  const fileName = segment.label.trim() || '引用文件';
  return {
    id: decodeURIComponent(match[1]),
    fileName,
    fileType: inferFileType(fileName),
  } satisfies PreviewDocumentItem;
}

export function inferFileType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && extension !== fileName.toLowerCase() ? extension : '';
}

export function formatTime(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-';
}
