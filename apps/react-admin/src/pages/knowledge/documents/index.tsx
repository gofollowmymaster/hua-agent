import { useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
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
  deleteDocument,
  getDocumentPreviewFile,
  ingestDocuments,
  pageDocuments,
  type RagDocumentItem,
} from '@/api/knowledge/documents';
import { DocumentPreviewModal } from '@/components/document-preview';
import { SemanticTag } from '@/components/semantic-tag';
import { useDrawerQuery } from '@/layouts/drawer-query';
import { compactProTableProps } from '@/theme';
import { DocumentMetadataModal } from './metadata-modal';
import { DocumentUploadModal } from './upload-modal';

function formatSize(value: string | number) {
  const size = Number(value || 0);
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

export default function DocumentsPage() {
  const actionRef = useRef<ActionType>();
  const { message, modal } = App.useApp();
  const drawer = useDrawerQuery();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [metadataItem, setMetadataItem] = useState<RagDocumentItem>();
  const [previewItem, setPreviewItem] = useState<RagDocumentItem>();
  const [ingesting, setIngesting] = useState(false);

  const columns: ProColumns<RagDocumentItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '文件名 / 路径', allowClear: true },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      hideInSearch: true,
      width: 360,
      render: (_, item) => (
        <div>
          <Button type="link" onClick={() => setPreviewItem(item)}>
            {item.fileName || '-'}
          </Button>
          <div className="muted">{item.sourcePath || '-'}</div>
          {item.error && <div className="error-text">{item.error}</div>}
        </div>
      ),
    },
    { title: '扩展名', dataIndex: 'fileType', hideInSearch: true, width: 90 },
    { title: 'type', dataIndex: 'type', hideInSearch: true, width: 110 },
    { title: 'tag', dataIndex: 'tag', hideInSearch: true, width: 140 },
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
      hideInSearch: true,
      width: 90,
      render: (_, item) => item.actualChunkCount ?? item.chunkCount ?? '-',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      hideInSearch: true,
      width: 90,
      render: (_, item) => formatSize(item.fileSize),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      hideInSearch: true,
      width: 160,
      render: (_, item) => dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 210,
      render: (_, item) => [
        <Typography.Link key="edit" onClick={() => setMetadataItem(item)}>
          <EditOutlined /> 编辑
        </Typography.Link>,
        <Typography.Link
          key="chunks"
          onClick={() => drawer.open('document-chunks', item.id)}
        >
          <EyeOutlined /> 切片实况
        </Typography.Link>,
        <Typography.Link
          key="delete"
          type="danger"
          onClick={() => confirmDelete(item)}
        >
          <DeleteOutlined /> 删除
        </Typography.Link>,
      ],
    },
  ];

  async function runIngest(force: boolean) {
    setIngesting(true);
    try {
      await ingestDocuments(force);
      message.success('索引任务已触发');
      actionRef.current?.reload();
    } finally {
      setIngesting(false);
    }
  }

  function confirmDelete(item: RagDocumentItem) {
    const count = item.actualChunkCount ?? item.chunkCount ?? 0;
    modal.confirm({
      title: '确认删除文档？',
      content: `将删除“${item.fileName}”及其 ${count} 个关联切片。raw 原文件会保留，后续扫描或强制重建可能重新入库。`,
      okText: '删除',
      okButtonProps: { danger: true },
      async onOk() {
        await deleteDocument(item.id);
        message.success('文档及关联切片已删除');
        actionRef.current?.reload();
      },
    });
  }

  return (
    <>
      <ProTable<RagDocumentItem>
        {...compactProTableProps}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1280 }}
        request={async (params) => {
          const result = await pageDocuments(params);
          return { data: result.list, total: result.total, success: true };
        }}
        onRow={(item) => ({
          onClick: (event) => {
            if ((event.target as HTMLElement).closest('a,button')) return;
            drawer.open('document-chunks', item.id);
          },
          style: { cursor: 'pointer' },
        })}
        toolBarRender={() => [
          <Button
            key="upload"
            type="primary"
            onClick={() => setUploadOpen(true)}
          >
            <PlusOutlined /> 添加文档
          </Button>,
          <Button
            key="rebuild"
            danger
            loading={ingesting}
            onClick={() =>
              modal.confirm({
                title: '确认强制重建索引？',
                content:
                  '请确认文档已准备好。本次操作将重建全部文档索引，耗时较长，请耐心等待。',
                okText: '确认重建',
                onOk: () => runIngest(true),
              })
            }
          >
            <ReloadOutlined /> 强制重建索引
          </Button>,
        ]}
      />
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => actionRef.current?.reload()}
      />
      <DocumentMetadataModal
        item={metadataItem}
        onClose={() => setMetadataItem(undefined)}
        onSaved={() => actionRef.current?.reload()}
      />
      <DocumentPreviewModal
        open={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        loadFile={(item) => getDocumentPreviewFile(item.id)}
      />
    </>
  );
}
