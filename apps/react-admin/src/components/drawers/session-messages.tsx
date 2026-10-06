import { useEffect, useState } from 'react';
import { Alert, Empty, Listy, Spin } from 'antd';
import dayjs from 'dayjs';
import {
  listSessionMessages,
  type RagMessageItem,
} from '@/api/knowledge/sessions';
import { SemanticTag } from '@/components/semantic-tag';

export function SessionMessages({ id }: { id: string }) {
  const [messages, setMessages] = useState<RagMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void listSessionMessages(id)
      .then((result) => active && setMessages(result))
      .catch(() => active && setError('消息加载失败，请稍后重试。'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);
  if (error) return <Alert type="error" showIcon title={error} />;
  return (
    <Spin spinning={loading}>
      {messages.length > 0 ? (
        <Listy
          items={messages}
          rowKey={(item) => item.id}
          styles={{
            item: {
              padding: '8px 0',
              borderBlockEnd: '1px solid var(--app-color-divider)',
            },
          }}
          itemRender={(item) => (
            <div>
              <div>
                <SemanticTag
                  tone={item.role === 'assistant' ? 'info' : 'success'}
                >
                  {item.role === 'assistant' ? '助手' : '用户'}
                </SemanticTag>
                {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {item.content}
              </div>
            </div>
          )}
        />
      ) : (
        !loading && <Empty description="暂无消息" />
      )}
    </Spin>
  );
}
