import { useRef, useState } from 'react';
import {
  DeleteOutlined,
  EyeOutlined,
  ImportOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { App, Button, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  deleteAgentKnowledgeDocument,
  getAgentKnowledgeDocumentPreviewFile,
  ingestAgentKnowledge,
  pageAgentKnowledgeDocuments,
  type AgentKnowledgeDocumentItem,
} from '@/api/business-agent/knowledge';
import { DocumentPreviewModal } from '@/components/document-preview';
import { SemanticTag } from '@/components/semantic-tag';
import { useDrawerQuery } from '@/layouts/drawer-query';
import { compactProTableProps } from '@/theme';

function formatSize(value: string | number) {
  const size = Number(value || 0);
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

export default function AgentKnowledgePage() {
  const actionRef = useRef<ActionType>();
  const drawer = useDrawerQuery();
  const { message, modal } = App.useApp();
  const [previewItem, setPreviewItem] = useState<AgentKnowledgeDocumentItem>();
  const [ingesting, setIngesting] = useState(false);

  async function runIngest(force: boolean) {
    setIngesting(true);
    try {
      await ingestAgentKnowledge(force);
      message.success(force ? '强制重建索引任务已触发' : '入库任务已触发');
      actionRef.current?.reload();
    } finally {
      setIngesting(false);
    }
  }

  function remove(item: AgentKnowledgeDocumentItem) {
    const count = item.actualChunkCount ?? item.chunkCount ?? 0;
    modal.confirm({
      title: '确认删除文档？',
      content: `将删除“${item.fileName}”及其 ${count} 个关联切片。docs 原文件会保留，后续入库可能重新索引。`,
      okText: '删除',
      okButtonProps: { danger: true },
      async onOk() {
        await deleteAgentKnowledgeDocument(item.id);
        message.success('文档及关联切片已删除');
        actionRef.current?.reload();
      },
    });
  }

  const columns: ProColumns<AgentKnowledgeDocumentItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: '文件名 / 路径 / 面包屑 / 正文',
        allowClear: true,
      },
    },
    { title: 'ID', dataIndex: 'id', search: false, width: 100 },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      fieldProps: { placeholder: '如 业务流程', allowClear: true },
      render: (_, item) => (
        <SemanticTag tone="info">{item.category || '-'}</SemanticTag>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      search: false,
      width: 380,
      render: (_, item) => (
        <div>
          <Button type="link" onClick={() => setPreviewItem(item)}>
            {item.fileName || '-'}
          </Button>
          <div className="muted">{item.sourcePath || '-'}</div>
          {item.breadcrumb && <div className="muted">{item.breadcrumb}</div>}
          {item.error && <div className="error-text">{item.error}</div>}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 110,
      valueEnum: {
        ready: { text: 'ready', status: 'Success' },
        failed: { text: 'failed', status: 'Error' },
      },
      render: (_, item) => (
        <SemanticTag tone={item.status === 'failed' ? 'error' : 'success'}>
          {item.status || '-'}
        </SemanticTag>
      ),
    },
    {
      title: '片段数',
      dataIndex: 'chunkCount',
      search: false,
      width: 90,
      render: (_, item) => item.actualChunkCount ?? item.chunkCount ?? '-',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      search: false,
      width: 90,
      render: (_, item) => formatSize(item.fileSize),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      search: false,
      width: 160,
      render: (_, item) => dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, item) => [
        <Typography.Link
          key="chunks"
          onClick={() => drawer.open('agent-knowledge-chunks', item.id)}
        >
          <EyeOutlined /> 切片实况
        </Typography.Link>,
        <Typography.Link
          key="delete"
          type="danger"
          onClick={() => remove(item)}
        >
          <DeleteOutlined /> 删除
        </Typography.Link>,
      ],
    },
  ];

  return (
    <>
      <ProTable<AgentKnowledgeDocumentItem>
        {...compactProTableProps}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1280 }}
        request={async (params) => {
          const result = await pageAgentKnowledgeDocuments(params);
          return { data: result.list, total: result.total, success: true };
        }}
        onRow={(item) => ({
          onClick: (event) => {
            if ((event.target as HTMLElement).closest('a,button')) return;
            drawer.open('agent-knowledge-chunks', item.id);
          },
          style: { cursor: 'pointer' },
        })}
        toolBarRender={() => [
          <Button
            key="ingest"
            type="primary"
            loading={ingesting}
            onClick={() => runIngest(false)}
          >
            <ImportOutlined /> 触发入库
          </Button>,
          <Button
            key="rebuild"
            danger
            disabled={ingesting}
            onClick={() =>
              modal.confirm({
                title: '确认强制重建索引？',
                content:
                  '本次操作将重新解析 docs 目录并重建全部文档切片，耗时较长，请确认文档已就绪。',
                okText: '确认重建',
                onOk: () => runIngest(true),
              })
            }
          >
            <ReloadOutlined /> 强制重建索引
          </Button>,
        ]}
      />
      <DocumentPreviewModal
        open={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        loadFile={(item) => getAgentKnowledgeDocumentPreviewFile(item.id)}
      />
    </>
  );
}
