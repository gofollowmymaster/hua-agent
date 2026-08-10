import dayjs from 'dayjs';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';
import { useDocumentPreviewModal } from '@aplus-sql/ui-kit';
import type {
  ChatDemoAdapter,
  ChatDemoMessage
} from '@aplus-sql/ui-kit/chat-demo';
import { createUnauthorizedFetch } from '@/api/common/unauthorized-fetch';
import { useUserStore } from '@/stores/modules/user';
import {
  listSessionMessages,
  pageSessions,
  type RagMessageItem
} from '@/api/knowledge-qa/sessions';
import { getDocumentPreviewFile } from '@/api/knowledge-qa/documents';

interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

/** 创建知识问答 Demo 的共享聊天 adapter。 */
export function createRagChatAdapter(): ChatDemoAdapter {
  const userStore = useUserStore();
  const unauthorizedFetch = createUnauthorizedFetch(() => userStore.logout());
  const previewModal = useDocumentPreviewModal<PreviewDocumentItem>({
    loadFile: (item) => getDocumentPreviewFile(item.id)
  });

  return {
    chatApi: `${apiBaseUrl}/ai/rag/chat`,
    channel: 'web',
    conversationType: 'rag-chat',
    getParticipantId: () =>
      userStore.userInfo.userId ||
      userStore.userInfo.email ||
      userStore.displayName,
    createSession(id, participantId) {
      return new Chat({
        id,
        transport: new DefaultChatTransport({
          api: `${apiBaseUrl}/ai/rag/chat`,
          fetch: unauthorizedFetch,
          headers: () => buildAuthHeaders(userStore),
          body: () => ({ participantId })
        })
      });
    },
    pageSessions: (params) => pageSessions(params),
    listMessages: (id) => listSessionMessages(id),
    toUiMessages: (messages) => toUiMessages(messages),
    formatStatus,
    formatTime,
    onMarkdownClick(event) {
      handleMarkdownClick(event, previewModal);
    }
  };
}

function buildAuthHeaders(userStore: ReturnType<typeof useUserStore>) {
  const token = userStore.token;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function toUiMessages(historyMessages: RagMessageItem[]): ChatDemoMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant'
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: message.content }]
    })) as ChatDemoMessage[];
}

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';
  const statusData = data as {
    stage?: string;
    message?: string;
    chunks?: number;
  };
  if (statusData.chunks != null) {
    return `${statusData.message || '状态更新'} · ${statusData.chunks} 个片段`;
  }
  return statusData.message || statusData.stage || '状态更新';
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-';
}

function handleMarkdownClick(
  event: MouseEvent,
  previewModal: ReturnType<typeof useDocumentPreviewModal<PreviewDocumentItem>>
) {
  const link = (event.target as HTMLElement | null)?.closest('a');
  if (!link) return;

  const previewItem = resolvePreviewDocument({
    href: link.getAttribute('href') || '',
    label: link.textContent || ''
  });
  if (!previewItem) return;

  event.preventDefault();
  previewModal.open(previewItem);
}

function resolvePreviewDocument(segment: { href: string; label: string }) {
  const match = segment.href.match(
    /^\/(?:api\/)?ai\/rag\/admin\/documents\/([^/]+)\/preview$/
  );
  if (!match) return null;

  const fileName = segment.label.trim() || '引用文件';
  return {
    id: decodeURIComponent(match[1]),
    fileName,
    fileType: inferFileType(fileName)
  } satisfies PreviewDocumentItem;
}

function inferFileType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && extension !== fileName.toLowerCase() ? extension : '';
}
