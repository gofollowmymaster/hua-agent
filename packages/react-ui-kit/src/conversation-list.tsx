import { ReloadOutlined } from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import { Button, Empty, Spin, Tooltip, theme } from 'antd';
import type { ChatSessionItem } from './types';

export interface ConversationListProps {
  sessions: ChatSessionItem[];
  activeKey?: string;
  loading?: boolean;
  title?: string;
  onSelect: (session: ChatSessionItem) => void | Promise<void>;
  onReload: () => void | Promise<void>;
  onCreate: () => void | Promise<void>;
  formatTime: (value?: string) => string;
}

/** Renders the controlled history list and delegates all session actions. */
export function ConversationList({
  sessions,
  activeKey,
  loading = false,
  title = '历史会话',
  onSelect,
  onReload,
  onCreate,
  formatTime,
}: ConversationListProps) {
  const { token } = theme.useToken();
  const byKey = new Map(
    sessions.map((session) => [String(session.id), session]),
  );

  return (
    <section
      className="react-ui-kit-conversations"
      aria-label={title}
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
      }}
    >
      <header className="react-ui-kit-conversations-header">
        <strong>{title}</strong>
        <Tooltip title="刷新会话">
          <Button
            type="text"
            aria-label="刷新会话"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void onReload()}
          />
        </Tooltip>
      </header>
      <Spin spinning={loading} className="react-ui-kit-conversations-spin">
        <Conversations
          activeKey={activeKey}
          creation={{
            label: '新建会话',
            onClick: () => void onCreate(),
          }}
          items={sessions.map((session) => ({
            key: String(session.id),
            label: (
              <span className="react-ui-kit-conversation-label">
                <span className="react-ui-kit-conversation-title">
                  {session.latestMessage?.content.slice(0, 20) ||
                    session.conversationId ||
                    '未命名会话'}
                </span>
                <span
                  className="react-ui-kit-conversation-meta"
                  style={{ color: token.colorTextSecondary }}
                >
                  {session.messageCount} 条 · {formatTime(session.lastActiveAt)}
                </span>
              </span>
            ),
          }))}
          onActiveChange={(key) => {
            const session = byKey.get(String(key));
            if (session) void onSelect(session);
          }}
        />
        {sessions.length === 0 && !loading && (
          <Empty
            className="react-ui-kit-conversations-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无历史会话"
          />
        )}
      </Spin>
    </section>
  );
}
