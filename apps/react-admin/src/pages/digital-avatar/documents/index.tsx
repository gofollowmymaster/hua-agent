import { useRef, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { App, Button, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  deleteDigitalAvatarDocument,
  getDigitalAvatarPreviewFile,
  pageDigitalAvatarDocuments,
  reingestDigitalAvatarDocument,
  type DigitalAvatarDocumentItem,
} from '@/api/digital-avatar/documents';
import { DocumentPreviewModal } from '@/components/document-preview';
import { SemanticTag } from '@/components/semantic-tag';
import { useDrawerQuery } from '@/layouts/drawer-query';
import { compactProTableProps } from '@/theme';
import { DigitalAvatarSummaryModal } from './summary-modal';
import { DigitalAvatarUploadModal } from './upload-modal';

function formatSize(value: string | number) {
  const size = Number(value || 0);
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

export default function DigitalAvatarDocumentsPage() {
  const actionRef = useRef<ActionType>();
  const { message, modal } = App.useApp();
  const drawer = useDrawerQuery();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summaryItem, setSummaryItem] = useState<DigitalAvatarDocumentItem>();
  const [previewItem, setPreviewItem] = useState<DigitalAvatarDocumentItem>();
  const [reingestingId, setReingestingId] = useState<string | number>();

  async function reingest(item: DigitalAvatarDocumentItem) {
    setReingestingId(item.id);
    try {
      await reingestDigitalAvatarDocument(item.id);
      message.success('文档切片和摘要已重新入库');
      actionRef.current?.reload();
    } finally {
      setReingestingId(undefined);
    }
  }

  function confirmDelete(item: DigitalAvatarDocumentItem) {
    const count = item.actualChunkCount ?? item.chunkCount ?? 0;
    modal.confirm({
      title: '确认删除文档？',
      content: `将删除“${item.fileName}”及其 ${count} 个切片，受控目录中的原文件会保留。`,
      okText: '删除',
      okButtonProps: { danger: true },
      async onOk() {
        await deleteDigitalAvatarDocument(item.id);
        message.success('文档及切片已删除');
        actionRef.current?.reload();
      },
    });
  }

  const columns: ProColumns<DigitalAvatarDocumentItem>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '文件名 / 路径 / 摘要', allowClear: true },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      search: false,
      width: 300,
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
    {
      title: '摘要',
      dataIndex: 'summary',
      search: false,
      width: 360,
      render: (_, item) => (
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: false, tooltip: item.summary }}
          style={{ marginBottom: 0 }}
        >
          {item.summary || '-'}
        </Typography.Paragraph>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
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
      title: '切片数',
      dataIndex: 'chunkCount',
      search: false,
      width: 80,
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
      width: 150,
      render: (_, item) => dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 280,
      render: (_, item) => [
        <Typography.Link key="summary" onClick={() => setSummaryItem(item)}>
          <EditOutlined /> 摘要
        </Typography.Link>,
        <Typography.Link
          key="chunks"
          onClick={() => drawer.open('digital-avatar-chunks', item.id)}
        >
          <EyeOutlined /> 切片
        </Typography.Link>,
        <Typography.Link
          key="reingest"
          disabled={reingestingId === item.id}
          onClick={() =>
            modal.confirm({
              title: '确认重新入库？',
              content: '将重建全部切片，并用最后一节正文覆盖当前摘要。',
              okText: '重新入库',
              onOk: () => reingest(item),
            })
          }
        >
          <SyncOutlined spin={reingestingId === item.id} /> 重建
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

  return (
    <>
      <ProTable<DigitalAvatarDocumentItem>
        {...compactProTableProps}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1450 }}
        request={async (params) => {
          const result = await pageDigitalAvatarDocuments(params);
          return { data: result.list, total: result.total, success: true };
        }}
        onRow={(item) => ({
          onClick: (event) => {
            if ((event.target as HTMLElement).closest('a,button')) return;
            drawer.open('digital-avatar-chunks', item.id);
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
        ]}
      />
      <DigitalAvatarUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => actionRef.current?.reload()}
      />
      <DigitalAvatarSummaryModal
        item={summaryItem}
        onClose={() => setSummaryItem(undefined)}
        onSaved={() => actionRef.current?.reload()}
      />
      <DocumentPreviewModal
        open={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        loadFile={(item) => getDigitalAvatarPreviewFile(item.id)}
      />
    </>
  );
}
