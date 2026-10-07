import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { ChatBox } from './chat-box';
import { ConversationList } from './conversation-list';
import type { ChatSessionItem, ChatWorkspaceProps } from './types';
import './style.css';

interface ChatRuntime {
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  sendMessage: (message: { text: string }) => Promise<void>;
  stop: () => Promise<void>;
  status: string;
  error?: Error;
  clearError: () => void;
}

const HISTORY_PAGE_SIZE = 20;

/** Coordinates session history with an AI SDK streaming chat runtime. */
export function ChatWorkspace({
  adapter,
  participantId,
  assistantName = '助手',
  userName = '你',
  historyTitle = '历史会话',
  emptyTitle = '输入问题开始演示',
  emptyDescription = '助手会检索知识库并以流式方式返回答案。',
  onPreview,
}: ChatWorkspaceProps) {
  const [chatId, setChatId] = useState(createLocalChatId);
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<Error>();
  const transport = useMemo(
    () => adapter.createTransport(participantId),
    [adapter, participantId],
  );
  const runtime = (useChat as unknown as (options: unknown) => ChatRuntime)({
    id: chatId,
    transport,
  });
  const pendingHistory = useRef<{ chatId: string; messages: UIMessage[] }>();
  const stopPromise = useRef<Promise<void>>();
  const busy = runtime.status === 'submitted' || runtime.status === 'streaming';

  const loadSessions = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await adapter.pageSessions({
        page: 1,
        pageSize: HISTORY_PAGE_SIZE,
        channel: adapter.channel,
        conversationType: adapter.conversationType,
        userId: participantId,
      });
      setSessions(result.list);
      setWorkspaceError(undefined);
      return result.list;
    } catch (error) {
      setWorkspaceError(toError(error));
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [adapter, participantId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (pendingHistory.current?.chatId !== chatId) return;
    runtime.setMessages(pendingHistory.current.messages);
    pendingHistory.current = undefined;
  }, [chatId, runtime]);

  async function stopChat() {
    if (!busy) return;
    if (!stopPromise.current) {
      stopPromise.current = runtime.stop().finally(() => {
        stopPromise.current = undefined;
      });
    }
    await stopPromise.current;
  }

  async function selectSession(session: ChatSessionItem) {
    await stopChat();
    setSelectedId(String(session.id));
    setMessageLoading(true);
    try {
      const messages = await adapter.listMessages(session.id);
      const nextChatId = session.conversationId || createLocalChatId();
      const nextMessages = adapter.toUiMessages(messages);
      if (nextChatId === chatId) {
        runtime.setMessages(nextMessages);
      } else {
        pendingHistory.current = { chatId: nextChatId, messages: nextMessages };
        setChatId(nextChatId);
      }
      setInput('');
      setWorkspaceError(undefined);
      runtime.clearError();
    } catch (error) {
      setWorkspaceError(toError(error));
    } finally {
      setMessageLoading(false);
    }
  }

  async function send(value: string) {
    const text = value.trim();
    if (!text || busy || messageLoading) return;
    setInput('');
    try {
      await runtime.sendMessage({ text });
    } finally {
      const next = await loadSessions();
      const matched = next.find((item) => item.conversationId === chatId);
      if (matched) setSelectedId(String(matched.id));
    }
  }

  async function startNewSession() {
    await stopChat();
    setSelectedId('');
    setChatId(createLocalChatId());
    runtime.setMessages([]);
    runtime.clearError();
    setInput('');
  }

  async function clearChat() {
    await stopChat();
    runtime.setMessages([]);
    runtime.clearError();
    setInput('');
  }

  function clearErrors() {
    setWorkspaceError(undefined);
    runtime.clearError();
  }

  const statusText = messageLoading
    ? '加载历史消息'
    : runtime.status === 'error' || workspaceError
      ? '出错'
      : busy
        ? '生成中'
        : '就绪';

  return (
    <div className="react-ui-kit-workspace">
      <ConversationList
        sessions={sessions}
        activeKey={selectedId}
        loading={historyLoading}
        title={historyTitle}
        formatTime={adapter.formatTime}
        onReload={async () => {
          await loadSessions();
        }}
        onCreate={startNewSession}
        onSelect={selectSession}
      />
      <ChatBox
        messages={runtime.messages}
        adapter={adapter}
        value={input}
        busy={busy}
        loading={messageLoading}
        error={runtime.error || workspaceError}
        statusText={statusText}
        assistantName={assistantName}
        userName={userName}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onChange={setInput}
        onSubmit={send}
        onStop={stopChat}
        onClear={clearChat}
        onClearError={clearErrors}
        onPreview={onPreview}
      />
    </div>
  );
}

function createLocalChatId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `react-ui-kit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
