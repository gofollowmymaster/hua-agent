import dayjs from 'dayjs';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';
import type {
  ChatDemoAdapter,
  ChatDemoMessage
} from '@aplus-sql/ui-kit/chat-demo';
import { createUnauthorizedFetch } from '@/api/common/unauthorized-fetch';
import { useUserStore } from '@/stores/modules/user';
import {
  agentChatApiUrl,
  listAgentChatMessages,
  pageAgentChatSessions,
  type AgentChatMessageItem
} from '@/api/business-agent/chat';

/** 创建业务 Agent Demo 的共享聊天 adapter。 */
export function createAgentChatAdapter(): ChatDemoAdapter {
  const userStore = useUserStore();
  const unauthorizedFetch = createUnauthorizedFetch(() => userStore.logout());

  return {
    chatApi: agentChatApiUrl,
    channel: 'agent-web',
    conversationType: 'agent-chat',
    getParticipantId: () =>
      userStore.userInfo.userId ||
      userStore.userInfo.email ||
      userStore.displayName,
    createSession(id, participantId) {
      return new Chat({
        id,
        transport: new DefaultChatTransport({
          api: agentChatApiUrl,
          fetch: unauthorizedFetch,
          headers: () => buildAuthHeaders(userStore),
          body: () => ({ participantId })
        })
      });
    },
    pageSessions: (params) => pageAgentChatSessions(params),
    listMessages: (id) => listAgentChatMessages(id),
    toUiMessages: (messages) =>
      toUiMessages(messages as AgentChatMessageItem[]),
    formatStatus,
    formatTime
  };
}

function buildAuthHeaders(userStore: ReturnType<typeof useUserStore>) {
  const token = userStore.token;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function toUiMessages(
  historyMessages: AgentChatMessageItem[]
): ChatDemoMessage[] {
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
    tool?: string;
  };
  if (statusData.message) return statusData.message;
  if (statusData.tool) return `调用工具：${statusData.tool}`;
  return statusData.stage || '状态更新';
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
