import dayjs from 'dayjs';
import { DefaultChatTransport, type UIMessage } from 'ai';
import type { ChatAdapter } from '@aplus-sql/react-ui-kit';
import { apiBaseUrl, createUnauthorizedFetch } from '@/api/common/http';
import {
  listAgentChatMessages,
  pageAgentChatSessions,
  type AgentChatMessageItem,
  type AgentChatMessagePart,
} from '@/api/business-agent/chat';
import { currentAccessToken } from '@/auth/storage';

interface LegacyToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result: string;
}

export function createAgentChatAdapter(): ChatAdapter {
  return {
    channel: 'agent-web',
    conversationType: 'agent-chat',
    createTransport(participantId) {
      return new DefaultChatTransport({
        api: `${apiBaseUrl}/agent/chat`,
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
    pageSessions: pageAgentChatSessions,
    listMessages: (id) => listAgentChatMessages(id),
    toUiMessages: (messages) =>
      toAgentUiMessages(messages as AgentChatMessageItem[]),
    formatStatus,
    formatTime: (value) =>
      value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-',
  };
}

export function toAgentUiMessages(
  messages: AgentChatMessageItem[],
): UIMessage[] {
  return messages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant',
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: (isOrderedParts(message.parts)
        ? message.parts
        : toLegacyParts(message)) as UIMessage['parts'],
    }));
}

function isOrderedParts(
  parts: AgentChatMessagePart[] | undefined,
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
    Boolean(value.data) &&
    typeof value.data === 'object' &&
    !Array.isArray(value.data)
  );
}

function toLegacyParts(message: AgentChatMessageItem): AgentChatMessagePart[] {
  const parts: AgentChatMessagePart[] = [];
  if (Array.isArray(message.toolCalls)) {
    for (const toolCall of message.toolCalls as LegacyToolCall[]) {
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

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';
  const status = data as { stage?: string; message?: string; tool?: string };
  if (status.message) return status.message;
  if (status.tool) return `调用工具：${status.tool}`;
  return status.stage || '状态更新';
}
