import { useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { App, Button, Switch, Tabs, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  deleteUserSkill,
  listSystemSkills,
  pageUserSkills,
  updateUserSkill,
  type SystemSkillItem,
  type UserSkillItem,
} from '@/api/business-agent/skills';
import { SemanticTag } from '@/components/semantic-tag';
import { compactProTableProps } from '@/theme';
import { SkillDetailModal } from './skill-detail-modal';
import { SkillFormModal } from './skill-form-modal';

export default function AgentSkillsPage() {
  const systemActionRef = useRef<ActionType>();
  const userActionRef = useRef<ActionType>();
  const { message, modal } = App.useApp();
  const [detailItem, setDetailItem] = useState<
    SystemSkillItem | UserSkillItem
  >();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserSkillItem>();

  const systemColumns: ProColumns<SystemSkillItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '名称 / 描述 / 指令', allowClear: true },
    },
    { title: '名称', dataIndex: 'name', search: false, width: 180 },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      search: false,
      width: 110,
      render: () => <SemanticTag tone="success">强制启用</SemanticTag>,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, item) => [
        <Typography.Link key="view" onClick={() => setDetailItem(item)}>
          <EyeOutlined /> 查看
        </Typography.Link>,
      ],
    },
  ];

  const userColumns: ProColumns<UserSkillItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '名称 / 描述 / 指令', allowClear: true },
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      valueType: 'select',
      width: 110,
      valueEnum: {
        true: { text: '已启用' },
        false: { text: '已停用' },
      },
      render: (_, item) => (
        <SemanticTag tone={item.isEnabled ? 'success' : 'neutral'}>
          {item.isEnabled ? '已启用' : '已停用'}
        </SemanticTag>
      ),
    },
    { title: '名称', dataIndex: 'name', search: false, width: 180 },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      search: false,
      width: 160,
      render: (_, item) => dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '启用',
      dataIndex: 'enabledAction',
      search: false,
      width: 80,
      render: (_, item) => (
        <Switch
          checked={item.isEnabled}
          onChange={async (isEnabled) => {
            await updateUserSkill(item.id, { isEnabled });
            message.success(
              isEnabled ? '用户 Skill 已启用' : '用户 Skill 已停用',
            );
            userActionRef.current?.reload();
          }}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 210,
      render: (_, item) => [
        <Typography.Link key="view" onClick={() => setDetailItem(item)}>
          <EyeOutlined /> 查看
        </Typography.Link>,
        <Typography.Link
          key="edit"
          onClick={() => {
            setEditingItem(item);
            setFormOpen(true);
          }}
        >
          <EditOutlined /> 编辑
        </Typography.Link>,
        <Typography.Link
          key="delete"
          type="danger"
          onClick={() =>
            modal.confirm({
              title: '确认删除用户 Skill？',
              content: `删除“${item.name}”后无法恢复。`,
              okText: '删除',
              okButtonProps: { danger: true },
              async onOk() {
                await deleteUserSkill(item.id);
                message.success('用户 Skill 已删除');
                userActionRef.current?.reload();
              },
            })
          }
        >
          <DeleteOutlined /> 删除
        </Typography.Link>,
      ],
    },
  ];

  return (
    <>
      <Tabs
        className="skill-tabs"
        destroyOnHidden={false}
        items={[
          {
            key: 'system',
            label: '系统 Skill',
            children: (
              <ProTable<SystemSkillItem>
                {...compactProTableProps}
                actionRef={systemActionRef}
                rowKey="key"
                columns={systemColumns}
                pagination={false}
                request={async (params) => {
                  const data = await listSystemSkills(
                    typeof params.keyword === 'string'
                      ? params.keyword
                      : undefined,
                  );
                  return { data, total: data.length, success: true };
                }}
              />
            ),
          },
          {
            key: 'user',
            label: '用户 Skill',
            children: (
              <ProTable<UserSkillItem>
                {...compactProTableProps}
                actionRef={userActionRef}
                rowKey="id"
                columns={userColumns}
                request={async (params) => {
                  const result = await pageUserSkills(params);
                  return {
                    data: result.list,
                    total: result.total,
                    success: true,
                  };
                }}
                toolBarRender={() => [
                  <Button
                    key="create"
                    type="primary"
                    onClick={() => {
                      setEditingItem(undefined);
                      setFormOpen(true);
                    }}
                  >
                    <PlusOutlined /> 新建 Skill
                  </Button>,
                ]}
              />
            ),
          },
        ]}
      />
      <SkillDetailModal
        item={detailItem}
        onClose={() => setDetailItem(undefined)}
      />
      <SkillFormModal
        open={formOpen}
        item={editingItem}
        onClose={() => setFormOpen(false)}
        onSaved={() => userActionRef.current?.reload()}
      />
    </>
  );
}
