import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';
import type {
  ChatDemoAdapter,
  ChatDemoMessage,
  ChatDemoMessageItem,
  ChatDemoOptions,
} from '@aplus-sql/ui-kit/chat-demo';

export interface AgentChatSdkOptions {
  baseUrl?: string;
  chatApi?: string;
  authType?: 'jwt' | 'secret';
  token?: string;
  supplier?: string;
  participantId?: string;
  channel?: string;
  conversationType?: string;
  options?: ChatDemoOptions;
  getToken?: () => string;
}

/** 创建可配置 JWT/Secret 鉴权的 Agent Chat adapter。 */
export function createAgentChatAdapter(
  config: AgentChatSdkOptions,
): ChatDemoAdapter {
  const baseUrl = config.baseUrl || '';
  const chatApi = config.chatApi || '/agent/chat';
  const authType = config.authType || 'secret';
  const participantId = config.participantId || 'anonymous';

  return {
    chatApi: `${baseUrl}${chatApi}`,
    channel: config.channel || 'agent-web',
    conversationType: config.conversationType || 'agent-chat',
    getParticipantId: () => participantId,
    createSession(id, currentParticipantId) {
      return new Chat({
        id,
        transport: new DefaultChatTransport({
          api: `${baseUrl}${chatApi}`,
          headers: () => buildHeaders(config, authType),
          body: () => ({ participantId: currentParticipantId }),
        }),
      });
    },
    pageSessions: (params) =>
      request(`${baseUrl}/agent/chat/sessions/page`, {
        method: 'POST',
        headers: buildHeaders(config, authType),
        body: JSON.stringify(params),
      }),
    listMessages: (id) =>
      request(`${baseUrl}/agent/chat/sessions/${id}/messages`, {
        method: 'GET',
        headers: buildHeaders(config, authType),
      }),
    toUiMessages: (messages) => toUiMessages(messages),
    formatStatus,
    formatTime,
  };
}

function buildHeaders(
  config: AgentChatSdkOptions,
  authType: 'jwt' | 'secret',
) {
  const token = config.getToken?.() ?? config.token ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ignore-supplier-check': 'true',
  };
  if (authType === 'jwt' && token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    headers.Authorization = token;
  }
  if (config.supplier) {
    headers.supplier = config.supplier;
  }
  return headers;
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = (await response.json()) as
    | { code?: number; body?: T }
    | T;
  if (!response.ok) {
    throw new Error(
      typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message?: unknown }).message === 'string'
        ? ((data as { message: string }).message || '请求失败')
        : '请求失败',
    );
  }
  if (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'body' in data
  ) {
    return (data as { body: T }).body;
  }
  return data as T;
}

function toUiMessages(
  historyMessages: ChatDemoMessageItem[],
): ChatDemoMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant',
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: message.content }],
    })) as ChatDemoMessage[];
}

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';
  const statusData = data as {
    stage?: string;
    message?: string;
    tool?: string;
    chunks?: number;
  };
  if (statusData.tool) return `调用工具：${statusData.tool}`;
  if (statusData.chunks != null) {
    return `${statusData.message || '状态更新'} · ${statusData.chunks} 个片段`;
  }
  return statusData.message || statusData.stage || '状态更新';
}

function formatTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}
