import { useEffect, useState } from 'react';
import { Alert, Empty, List, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  listSessionMessages,
  type RagMessageItem,
} from '@/api/knowledge/sessions';

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
  if (error) return <Alert type="error" showIcon message={error} />;
  return (
    <Spin spinning={loading}>
      <List
        dataSource={messages}
        locale={{ emptyText: <Empty description="暂无消息" /> }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <span>
                  <Tag color={item.role === 'assistant' ? 'blue' : 'green'}>
                    {item.role === 'assistant' ? '助手' : '用户'}
                  </Tag>
                  {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
              }
              description={
                <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
              }
            />
          </List.Item>
        )}
      />
    </Spin>
  );
}
