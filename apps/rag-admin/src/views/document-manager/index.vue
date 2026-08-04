<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>文档管理</h1>
        <p>查看、维护或删除已索引文档，也可触发 raw 目录重新入库。</p>
      </div>
    </header>

    <div class="grid-fill">
      <AgGrid :columns="columns" v-bind="gridProps">
        <template #title>
          <Space class="header-actions">
            <ApButton type="primary" @click="refresh">刷新</ApButton>
            <ApButton type="primary" @click="uploadModalRef?.show()"
              >添加文档</ApButton
            >
            <ApButton
              danger
              type="primary"
              :disabled="ingesting"
              @click="runIngest(true)"
            >
              强制重建索引
            </ApButton>
          </Space>
        </template>
      </AgGrid>
    </div>

    <DocumentPreviewModal ref="previewModalRef" />
    <DocumentChunkDrawer ref="chunkDrawerRef" />
    <DocumentUploadModal ref="uploadModalRef" @uploaded="refresh" />
    <ApModal
      v-model:open="metadataModalOpen"
      title="编辑文档元数据"
      :confirm-loading="metadataSaving"
      destroy-on-close
      @ok="saveMetadata"
      @cancel="closeMetadataModal"
    >
      <div class="metadata-form">
        <label class="metadata-field">
          <span>type</span>
          <input
            v-model="metadataForm.type"
            class="metadata-input"
            placeholder="业务分类"
          />
        </label>
        <label class="metadata-field">
          <span>tag</span>
          <input
            v-model="metadataForm.tag"
            class="metadata-input"
            placeholder="标签"
          />
        </label>
      </div>
    </ApModal>
  </section>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import dayjs from 'dayjs';
import { Space, message } from '@aplus-frontend/antdv';
import {
  AgGrid,
  ApButton,
  ApModal,
  ApTag,
  usePageListAgGrid,
  type AgGridColumnType,
} from '@aplus-frontend/ui';
import {
  deleteDocument,
  ingestDocuments,
  pageDocumentsGrid,
  updateDocumentMetadata,
  type RagDocumentItem,
} from '@/api/rag-admin';
import DocumentChunkDrawer from './components/document-chunk-drawer.vue';
import DocumentPreviewModal from '@/components/document-preview-modal.vue';
import DocumentUploadModal from './components/document-upload-modal.vue';

const ingesting = ref(false);
const metadataModalOpen = ref(false);
const metadataSaving = ref(false);
const editingDocument = ref<RagDocumentItem | null>(null);
const metadataForm = ref({
  type: '',
  tag: '',
});
const previewModalRef = ref<InstanceType<typeof DocumentPreviewModal>>();
const chunkDrawerRef = ref<InstanceType<typeof DocumentChunkDrawer>>();
const uploadModalRef = ref<InstanceType<typeof DocumentUploadModal>>();
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
        h(
          ApButton,
          {
            class: 'file-name-link',
            type: 'link',
            onClick: () => previewModalRef.value?.show(record),
          },
          () => record.fileName || '-',
        ),
        h('div', { class: 'muted path' }, record.sourcePath || '-'),
        record.error ? h('div', { class: 'error-text' }, record.error) : null,
      ]),
  },
  {
    title: '扩展名',
    key: 'fileType',
    dataIndex: 'fileType',
    width: 100,
    hideInSearch: true,
  },
  {
    title: 'type',
    key: 'type',
    dataIndex: 'type',
    width: 120,
    hideInSearch: true,
    customRender: ({ record }) => record.type || '-',
  },
  {
    title: 'tag',
    key: 'tag',
    dataIndex: 'tag',
    minWidth: 160,
    hideInSearch: true,
    customRender: ({ record }) => record.tag || '-',
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
    customRender: ({ record }) =>
      record.actualChunkCount ?? record.chunkCount ?? '-',
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
    width: 240,
    fixed: 'right',
    valueType: 'action',
    hideInSearch: true,
    fieldProps({ record }) {
      if (!record) {
        return {};
      }
      return {
        actions: [
          {
            text: '编辑',
            onClick: () => editMetadata(record),
          },
          {
            text: '切片实况',
            onClick: () => chunkDrawerRef.value?.show(record),
          },
          {
            text: '删除',
            color: 'error',
            onClick: () => remove(record),
          },
        ],
      };
    },
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
    x: 1280,
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
  const chunkCount = item.actualChunkCount ?? item.chunkCount ?? 0;
  ApModal.confirm({
    title: '确认删除文档？',
    content: `将删除“${item.fileName}”及其 ${chunkCount} 个关联切片。raw 原文件会保留，后续扫描或强制重建可能重新入库。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteDocument(item.id);
      message.success('文档及关联切片已删除');
      reload();
    },
  });
}

function editMetadata(item: RagDocumentItem) {
  editingDocument.value = item;
  metadataForm.value = {
    type: item.type || '',
    tag: item.tag || '',
  };
  metadataModalOpen.value = true;
}

async function saveMetadata() {
  if (!editingDocument.value) return;

  metadataSaving.value = true;
  try {
    await updateDocumentMetadata(editingDocument.value.id, {
      type: metadataForm.value.type,
      tag: metadataForm.value.tag,
    });
    message.success('文档元数据已更新');
    closeMetadataModal();
    reload();
  } finally {
    metadataSaving.value = false;
  }
}

function closeMetadataModal() {
  metadataModalOpen.value = false;
  editingDocument.value = null;
  metadataForm.value = {
    type: '',
    tag: '',
  };
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

<style scoped>
.file-name-link {
  height: auto;
  max-width: 100%;
  padding: 0;
  font-weight: 700;
  line-height: 20px;
  white-space: normal;
  text-align: left;
}

.metadata-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #344054;
  font-size: 13px;
  font-weight: 600;
}

.metadata-input {
  height: 36px;
  padding: 6px 11px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  color: #101828;
  font-size: 14px;
  line-height: 22px;
  outline: none;
}

.metadata-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgb(22 119 255 / 12%);
}
</style>
