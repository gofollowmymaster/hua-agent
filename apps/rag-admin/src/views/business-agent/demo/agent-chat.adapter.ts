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
  type AgentChatMessageItem,
  type AgentChatMessagePart
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

export function toUiMessages(
  historyMessages: AgentChatMessageItem[]
): ChatDemoMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant'
    )
    .map((message) => {
      const parts = isOrderedParts(message.parts)
        ? message.parts
        : toLegacyParts(message);
      return {
        id: String(message.id),
        role: message.role as 'user' | 'assistant',
        parts: parts as ChatDemoMessage['parts'],
      };
    }) as ChatDemoMessage[];
}

function isOrderedParts(
  parts: AgentChatMessagePart[] | undefined
): parts is AgentChatMessagePart[] {
  return Array.isArray(parts) && parts.every(isOrderedPart);
}

function isOrderedPart(part: unknown): part is AgentChatMessagePart {
  if (!part || typeof part !== 'object') return false;
  const value = part as Record<string, unknown>;
  if (value.type === 'text' || value.type === 'reasoning') {
    return typeof value.text === 'string';
  }
  return (
    value.type === 'data-status' &&
    !!value.data &&
    typeof value.data === 'object' &&
    !Array.isArray(value.data)
  );
}

function toLegacyParts(message: AgentChatMessageItem): AgentChatMessagePart[] {
  const parts: AgentChatMessagePart[] = [];
  if (Array.isArray(message.toolCalls)) {
    for (const toolCall of message.toolCalls as AgentToolCallRecord[]) {
      parts.push({
        type: 'data-status',
        data: {
          stage: 'tool_result',
          tool: toolCall.name,
          message: `工具执行完成：${toolCall.name}`,
          arguments: toolCall.arguments,
          result: toolCall.result,
        },
      });
    }
  }
  parts.push({ type: 'text', text: message.content });
  return parts;
}

interface AgentToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  result: string;
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
