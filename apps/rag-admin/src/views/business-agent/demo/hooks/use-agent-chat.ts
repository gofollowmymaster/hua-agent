import dayjs from 'dayjs';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { getToken } from '@/stores/modules/user/token';
import { useUserStore } from '@/stores/modules/user';
import {
  agentChatApiUrl,
  type AgentChatMessageItem
} from '@/api/business-agent/chat';

export interface AgentChatStatusData {
  stage?: string;
  message?: string;
  tool?: string;
}

export interface AgentChatDataParts {
  status: AgentChatStatusData;
  [key: string]: unknown;
}

export type AgentChatMessage = UIMessage<unknown, AgentChatDataParts>;

export function createAgentChatSession(id: string, participantId: string) {
  const userStore = useUserStore();

  return new Chat<AgentChatMessage>({
    id,
    transport: new DefaultChatTransport({
      api: agentChatApiUrl,
      headers: () => {
        const token = userStore.token || getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        return headers;
      },
      body: () => ({
        participantId
      })
    })
  });
}

export function toUiMessages(
  historyMessages: AgentChatMessageItem[]
): AgentChatMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant'
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text', text: message.content }]
    }));
}

export function createLocalChatId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `agent-chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';

  const statusData = data as AgentChatStatusData;
  if (statusData.tool) {
    return `调用工具：${statusData.tool}`;
  }
  return statusData.message || statusData.stage || '状态更新';
}

export function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
