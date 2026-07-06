<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>文档管理</h1>
        <p>查看已索引文档，删除索引，或触发 raw 目录重新入库。</p>
      </div>
    </header>

    <div class="grid-fill">
      <AgGrid :columns="columns" v-bind="gridProps">
        <template #title>
          <Space class="header-actions">
            <ApButton type="primary" @click="refresh">刷新</ApButton>
            <ApButton danger type="primary" :disabled="ingesting" @click="runIngest(true)">
              强制重建索引
            </ApButton>
          </Space>
        </template>
      </AgGrid>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import dayjs from 'dayjs';
import { Modal, Space, message } from '@aplus-frontend/antdv';
import {
  AgGrid,
  ApButton,
  ApTag,
  usePageListAgGrid,
  type AgGridColumnType,
} from '@aplus-frontend/ui';
import {
  deleteDocument,
  ingestDocuments,
  pageDocumentsGrid,
  type RagDocumentItem,
} from '@/api/rag-admin';

const ingesting = ref(false);
const statusValueEnum = {
  ready: { text: 'ready', color: '#12b76a' },
  failed: { text: 'failed', color: '#f04438' },
};

const columns: AgGridColumnType<RagDocumentItem>[] = [
  {
    title: '关键词',
    key: 'keyword',
    dataIndex: 'keyword',
    valueType: 'text',
    hideInTable: true,
    fieldProps: {
      placeholder: '文件名 / 路径',
      field: {
        allowClear: true,
      },
    },
  },
  {
    title: '文件名',
    key: 'fileName',
    dataIndex: 'fileName',
    minWidth: 360,
    flex: 1,
    hideInSearch: true,
    customRender: ({ record }) =>
      h('div', [
        h('div', { class: 'strong' }, record.fileName || '-'),
        h('div', { class: 'muted path' }, record.sourcePath || '-'),
        record.error ? h('div', { class: 'error-text' }, record.error) : null,
      ]),
  },
  {
    title: '类型',
    key: 'fileType',
    dataIndex: 'fileType',
    width: 100,
    hideInSearch: true,
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    width: 120,
    valueType: 'select',
    valueEnum: statusValueEnum,
    fieldProps: {
      placeholder: '全部状态',
      field: {
        allowClear: true,
      },
    },
    customRender: ({ record }) =>
      h(ApTag, {
        text: record.status || '-',
        color: record.status === 'failed' ? '#f04438' : '#12b76a',
      }),
  },
  {
    title: '片段数',
    key: 'chunkCount',
    dataIndex: 'chunkCount',
    width: 100,
    hideInSearch: true,
    customRender: ({ record }) => record.actualChunkCount ?? record.chunkCount ?? '-',
  },
  {
    title: '大小',
    key: 'fileSize',
    dataIndex: 'fileSize',
    width: 100,
    hideInSearch: true,
    customRender: ({ record }) => formatSize(record.fileSize),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    dataIndex: 'updatedAt',
    width: 170,
    hideInSearch: true,
    customRender: ({ record }) => formatTime(record.updatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    dataIndex: 'actions',
    width: 110,
    fixed: 'right',
    hideInSearch: true,
    customRender: ({ record }) =>
      h(
        ApButton,
        {
          danger: true,
          type: 'link',
          onClick: () => remove(record),
        },
        () => '删除索引',
      ),
  },
];

const [gridProps, { reload }] = usePageListAgGrid({
  api: pageDocumentsGrid,
  rowKey: 'id',
  rowHeight: 58,
  isShowRowSelection: false,
  adaptive: true,
  searchForm: {
    colon: false,
  },
  wrapperStyle: {
    height: '100%',
  },
  scroll: {
    x: 980,
  },
});

function refresh() {
  reload();
}

async function runIngest(force: boolean) {
  ingesting.value = true;
  try {
    await ingestDocuments(force);
    message.success('索引任务已触发');
    reload();
  } finally {
    ingesting.value = false;
  }
}

function remove(item: RagDocumentItem) {
  Modal.confirm({
    title: '确认删除索引？',
    content: `删除后将移除 ${item.fileName} 的已索引内容。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteDocument(item.id);
      message.success('索引已删除');
      reload();
    },
  });
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

function formatSize(value: string | number) {
  const size = Number(value || 0);
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}
</script>
