import {
  DeleteOutlined,
  RobotOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Bubble, Sender, Think, ThoughtChain, Welcome } from '@ant-design/x';
import type { BubbleItemType } from '@ant-design/x';
import { Alert, Button, Collapse, Tooltip, theme } from 'antd';
import type { UIMessage } from 'ai';
import { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  ChatAdapter,
  ChatA2uiData,
  ChatReferenceItem,
  ChatStatusData,
} from './types';

export interface ChatBoxProps {
  messages: UIMessage[];
  adapter: ChatAdapter;
  value: string;
  busy?: boolean;
  loading?: boolean;
  error?: Error;
  statusText: string;
  assistantName?: string;
  userName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void | Promise<void>;
  onStop: () => void | Promise<void>;
  onClear: () => void | Promise<void>;
  onClearError: () => void;
  onPreview?: (item: ChatReferenceItem) => void;
}

/** Renders a controlled Ant Design X message list and sender. */
export function ChatBox({
  messages,
  adapter,
  value,
  busy = false,
  loading = false,
  error,
  statusText,
  assistantName = '助手',
  userName = '你',
  emptyTitle = '输入问题开始演示',
  emptyDescription = '助手会检索知识库并以流式方式返回答案。',
  onChange,
  onSubmit,
  onStop,
  onClear,
  onClearError,
  onPreview,
}: ChatBoxProps) {
  const { token } = theme.useToken();
  const items = toBubbleItems({
    messages,
    adapter,
    assistantName,
    userName,
    busy,
    onPreview,
  });

  return (
    <section
      className="react-ui-kit-chat-box"
      aria-label="会话框"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
      }}
    >
      <div className="react-ui-kit-chat-toolbar">
        <span style={{ color: token.colorTextSecondary }}>{statusText}</span>
        <Tooltip title="清空当前消息">
          <Button
            type="text"
            aria-label="清空当前消息"
            icon={<DeleteOutlined />}
            onClick={() => void onClear()}
          />
        </Tooltip>
      </div>
      <div
        className="react-ui-kit-messages"
        aria-busy={loading}
        data-testid="chat-message-list"
      >
        {messages.length === 0 && !loading ? (
          <Welcome
            className="react-ui-kit-welcome"
            icon={<RobotOutlined />}
            title={emptyTitle}
            description={emptyDescription}
            variant="borderless"
          />
        ) : (
          <Bubble.List
            className="react-ui-kit-bubble-list"
            classNames={{ scroll: 'react-ui-kit-bubble-scroll' }}
            autoScroll
            items={items}
            role={{
              user: {
                placement: 'end',
                variant: 'filled',
                avatar: <UserOutlined />,
              },
              ai: {
                placement: 'start',
                variant: 'borderless',
                avatar: <RobotOutlined />,
              },
            }}
          />
        )}
        {loading && (
          <Bubble
            loading
            content=""
            header="正在加载历史消息"
            avatar={<RobotOutlined />}
          />
        )}
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          closable={{ onClose: onClearError }}
          title={error.message}
        />
      )}
      <div
        className="react-ui-kit-sender"
        style={{ borderTop: `1px solid ${token.colorSplit}` }}
      >
        <Sender
          value={value}
          loading={busy}
          disabled={loading}
          submitType="enter"
          autoSize={false}
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          onChange={(nextValue) => onChange(nextValue)}
          onSubmit={(message) => void onSubmit(message)}
          onCancel={() => void onStop()}
        />
      </div>
    </section>
  );
}

function toBubbleItems({
  messages,
  adapter,
  assistantName,
  userName,
  busy,
  onPreview,
}: {
  messages: UIMessage[];
  adapter: ChatAdapter;
  assistantName: string;
  userName: string;
  busy: boolean;
  onPreview?: (item: ChatReferenceItem) => void;
}): BubbleItemType[] {
  const lastMessage = messages.at(-1);
  return messages.map((message) => ({
    key: message.id,
    role: message.role === 'user' ? 'user' : 'ai',
    header: message.role === 'user' ? userName : assistantName,
    streaming: busy && message === lastMessage && message.role === 'assistant',
    status:
      busy && message === lastMessage && message.role === 'assistant'
        ? 'updating'
        : 'success',
    content: (
      <div
        className="react-ui-kit-message-parts"
        data-message-role={message.role}
      >
        {message.parts.map((part, index) =>
          renderPart(part, index, adapter, onPreview),
        )}
      </div>
    ),
  }));
}

function renderPart(
  part: UIMessage['parts'][number],
  index: number,
  adapter: ChatAdapter,
  onPreview?: (item: ChatReferenceItem) => void,
) {
  if (part.type === 'reasoning') {
    return (
      <Think
        key={part.id || String(index)}
        className="react-ui-kit-reasoning"
        title="思考过程"
        loading={part.state === 'streaming'}
        expanded
        destroyOnHidden={false}
      >
        {part.text}
      </Think>
    );
  }
  if (part.type === 'text') {
    return (
      <div key={index} className="react-ui-kit-markdown">
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
    const data = part.data as ChatStatusData;
    const tone = resolveStatusTone(data.stage);
    return data.stage !== 'tool_result' ? (
      <div key={index} className="react-ui-kit-status-wrapper">
        <ThoughtChain.Item
          className={`react-ui-kit-status react-ui-kit-status-${tone}`}
          data-stage={String(data.stage || '')}
          title={adapter.formatStatus(data)}
          icon={data.stage === 'tool_call' ? <ToolOutlined /> : undefined}
          status={resolveThoughtStatus(data.stage)}
          variant="outlined"
        />
      </div>
    ) : (
      <ToolResult data={data} />
    );
  }
  if (part.type === 'data-a2ui') {
    return (
      <Fragment key={index}>
        {adapter.renderA2uiPart?.(part.data as ChatA2uiData)}
      </Fragment>
    );
  }
  return null;
}

function ToolResult({ data }: { data: ChatStatusData }) {
  const hasArguments = data.arguments != null;
  const hasResult = data.result != null;

  if (!hasArguments && !hasResult) return null;

  return (
    <Collapse
      className="react-ui-kit-tool-details"
      size="small"
      expandIconPlacement="end"
      destroyOnHidden
      items={[
        {
          key: 'details',
          label: '工具调用详情',
          children: (
            <div className="react-ui-kit-tool-result">
              {hasArguments && (
                <section>
                  <strong>工具入参</strong>
                  <pre>{formatToolValue(data.arguments)}</pre>
                </section>
              )}
              {hasResult && (
                <section>
                  <strong>工具输出</strong>
                  <pre>{formatToolValue(data.result)}</pre>
                </section>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

function resolveThoughtStatus(stage?: string) {
  if (stage === 'generate_start') return 'loading';
  if (stage === 'error') return 'error';
  if (stage === 'abort' || stage === 'aborted') return 'abort';
  if (stage === 'tool_result' || stage === 'done') return 'success';
  return undefined;
}

function resolveStatusTone(stage?: string) {
  if (stage === 'tool_call') return 'warning';
  if (stage === 'tool_result' || stage === 'done') return 'success';
  if (stage === 'error') return 'error';
  return 'info';
}

function formatToolValue(value: unknown) {
  if (typeof value !== 'string') return JSON.stringify(value, null, 2);
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
