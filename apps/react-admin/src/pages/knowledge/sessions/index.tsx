import { useRef } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { pageSessions, type RagSessionItem } from '@/api/knowledge/sessions';
import { useDrawerQuery } from '@/layouts/drawer-query';

export default function SessionsPage() {
  const actionRef = useRef<ActionType>();
  const drawer = useDrawerQuery();
  const columns: ProColumns<RagSessionItem>[] = [
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 110,
      fieldProps: { placeholder: 'http / wecom', allowClear: true },
      render: (_, item) => <Tag color="blue">{item.channel || '-'}</Tag>,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      width: 140,
      fieldProps: { placeholder: 'user id', allowClear: true },
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '会话 / 消息', allowClear: true },
    },
    {
      title: '会话',
      dataIndex: 'sessionKey',
      hideInSearch: true,
      width: 260,
      render: (_, item) => (
        <div>
          <strong>{item.conversationId || item.sessionKey || '-'}</strong>
          <div className="muted">{item.sessionKey || '-'}</div>
        </div>
      ),
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      hideInSearch: true,
      width: 90,
      render: (_, item) => <Tag color="blue">{item.messageCount || 0} 条</Tag>,
    },
    {
      title: '最后消息',
      dataIndex: 'latestMessage',
      hideInSearch: true,
      ellipsis: true,
      render: (_, item) => item.latestMessage?.content || '暂无消息',
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      hideInSearch: true,
      width: 160,
      render: (_, item) => dayjs(item.lastActiveAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 110,
      render: (_, item) => [
        <Typography.Link
          key="messages"
          onClick={() => drawer.open('session-messages', item.id)}
        >
          <EyeOutlined /> 查看消息
        </Typography.Link>,
      ],
    },
  ];
  return (
    <ProTable<RagSessionItem>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      scroll={{ x: 1040 }}
      search={{ labelWidth: 'auto' }}
      request={async (params) => {
        const result = await pageSessions(params);
        return { data: result.list, total: result.total, success: true };
      }}
      onRow={(item) => ({
        onClick: (event) => {
          if ((event.target as HTMLElement).closest('a,button')) return;
          drawer.open('session-messages', item.id);
        },
        style: { cursor: 'pointer' },
      })}
    />
  );
}
