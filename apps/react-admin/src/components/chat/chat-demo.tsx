import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { useChat } from '@ai-sdk/react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  List,
  Space,
  Spin,
  Tag,
} from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { UIMessage } from 'ai';
import type { PreviewDocumentItem } from '@/components/document-preview';
import { resolveChatStatusTone } from '@/theme/chat-status';
import type { ChatDemoAdapter, ChatSessionItem } from './types';
import './style.css';

interface ChatDemoProps {
  adapter: ChatDemoAdapter;
  participantId: string;
  assistantName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onPreview?: (item: PreviewDocumentItem) => void;
}

function createLocalChatId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `chat-demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ChatDemo({
  adapter,
  participantId,
  assistantName = '助手',
  emptyTitle = '输入问题开始演示',
  emptyDescription = '助手会检索知识库并以流式方式返回答案。',
  onPreview,
}: ChatDemoProps) {
  const [chatId, setChatId] = useState(createLocalChatId);
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const transport = useMemo(
    () => adapter.createTransport(participantId),
    [adapter, participantId],
  );
  const runtime = (useChat as any)({ id: chatId, transport }) as {
    messages: UIMessage[];
    setMessages: (messages: UIMessage[]) => void;
    sendMessage: (message: { text: string }) => Promise<void>;
    stop: () => Promise<void>;
    status: string;
    error?: Error;
    clearError: () => void;
  };
  const setRuntimeMessages = runtime.setMessages;
  const messagePane = useRef<HTMLDivElement>(null);
  const pendingHistory = useRef<{ chatId: string; messages: UIMessage[] }>();
  const busy = runtime.status === 'submitted' || runtime.status === 'streaming';

  const loadSessions = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await adapter.pageSessions({
        page: 1,
        pageSize: 20,
        channel: adapter.channel,
        conversationType: adapter.conversationType,
        userId: participantId,
      });
      setSessions(result.list);
      return result.list;
    } finally {
      setHistoryLoading(false);
    }
  }, [adapter, participantId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const pane = messagePane.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [runtime.messages]);

  useEffect(() => {
    if (pendingHistory.current?.chatId !== chatId) return;
    setRuntimeMessages(pendingHistory.current.messages);
    pendingHistory.current = undefined;
  }, [chatId, setRuntimeMessages]);

  async function selectSession(session: ChatSessionItem) {
    if (busy) await runtime.stop();
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
      runtime.clearError();
    } finally {
      setMessageLoading(false);
    }
  }

  async function send() {
    const text = input.trim();
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
    if (busy) await runtime.stop();
    setSelectedId('');
    setChatId(createLocalChatId());
    runtime.setMessages([]);
    runtime.clearError();
    setInput('');
  }

  return (
    <div className="chat-demo-page">
      <Space>
        <Button type="primary" onClick={startNewSession}>
          新建会话
        </Button>
        {busy && <Button onClick={() => runtime.stop()}>停止</Button>}
        <Button
          onClick={() => {
            if (busy) void runtime.stop();
            runtime.setMessages([]);
            runtime.clearError();
          }}
        >
          清空
        </Button>
      </Space>
      <div className="chat-demo-workspace">
        <Card
          className="chat-history"
          title="历史会话"
          extra={
            <Button
              type="text"
              icon={<ReloadOutlined />}
              loading={historyLoading}
              onClick={loadSessions}
            />
          }
        >
          <List
            loading={historyLoading}
            dataSource={sessions}
            locale={{ emptyText: <Empty description="暂无历史会话" /> }}
            renderItem={(item) => (
              <List.Item
                className={
                  String(item.id) === selectedId
                    ? 'chat-history-item active'
                    : 'chat-history-item'
                }
                onClick={() => selectSession(item)}
              >
                <List.Item.Meta
                  title={
                    item.latestMessage?.content.slice(0, 20) ||
                    item.conversationId ||
                    '未命名会话'
                  }
                  description={`${item.messageCount} 条 · ${adapter.formatTime(item.lastActiveAt)}`}
                />
              </List.Item>
            )}
          />
        </Card>
        <Card className="chat-main" styles={{ body: { padding: 0 } }}>
          <div ref={messagePane} className="chat-messages" role="log">
            <Spin spinning={messageLoading}>
              {runtime.messages.length === 0 ? (
                <Empty description={`${emptyTitle} · ${emptyDescription}`} />
              ) : (
                runtime.messages.map((message) => (
                  <MessageView
                    key={message.id}
                    message={message}
                    assistantName={assistantName}
                    adapter={adapter}
                    onPreview={onPreview}
                  />
                ))
              )}
            </Spin>
          </div>
          {runtime.error && (
            <Alert
              type="error"
              showIcon
              closable
              title={runtime.error.message}
              onClose={runtime.clearError}
            />
          )}
          <div className="chat-composer">
            <Input.TextArea
              value={input}
              rows={3}
              disabled={busy || messageLoading}
              placeholder="输入问题，Enter 发送，Shift+Enter 换行"
              onChange={(event) => setInput(event.target.value)}
              onPressEnter={(event) => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <div className="chat-composer-footer">
              <span className="muted">
                {messageLoading
                  ? '加载历史消息'
                  : busy
                    ? '生成中'
                    : runtime.status === 'error'
                      ? '出错'
                      : '就绪'}
              </span>
              <Button
                type="primary"
                danger={busy}
                disabled={!busy && !input.trim()}
                onClick={() => (busy ? runtime.stop() : send())}
              >
                {busy ? '停止回答' : '发送'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MessageView({
  message,
  assistantName,
  adapter,
  onPreview,
}: {
  message: UIMessage;
  assistantName: string;
  adapter: ChatDemoAdapter;
  onPreview?: (item: PreviewDocumentItem) => void;
}) {
  return (
    <article className={`chat-message ${message.role}`}>
      <strong>{message.role === 'user' ? '你' : assistantName}</strong>
      <div>
        {message.parts.map((part, index) => {
          if (part.type === 'reasoning') {
            return (
              <details key={index} className="chat-reasoning" open>
                <summary>思考过程</summary>
                <div>{part.text}</div>
              </details>
            );
          }
          if (part.type === 'text') {
            return (
              <div key={index} className="chat-text">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href = '', children }) => (
                      <a
                        href={href}
                        onClick={(event) => {
                          const item = adapter.resolvePreview?.(
                            href,
                            String(children || ''),
                          );
                          if (item && onPreview) {
                            event.preventDefault();
                            onPreview(item);
                          }
                        }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }
          if (part.type === 'data-status') {
            const data = part.data as Record<string, unknown>;
            const tone = resolveChatStatusTone(data.stage);
            return (
              <div
                key={index}
                className={`chat-status chat-status-${tone}`}
                data-stage={String(data.stage || '')}
              >
                <Tag>{adapter.formatStatus(data)}</Tag>
                {data.stage === 'tool_result' && data.arguments != null && (
                  <pre>{JSON.stringify(data.arguments, null, 2)}</pre>
                )}
                {data.stage === 'tool_result' && data.result != null && (
                  <pre>{formatToolResult(data.result)}</pre>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </article>
  );
}

function formatToolResult(value: unknown) {
  if (typeof value !== 'string') return JSON.stringify(value, null, 2);
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
