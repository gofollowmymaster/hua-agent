<template>
  <section class="page">
    <div class="grid-fill">
      <AgGrid :columns="columns" v-bind="gridProps">
        <template #title="{ selectedRowKeys, clearAll }">
          <TableTopActionBar
            :selected-row-keys="selectedRowKeys"
            :clear-all="clearAll"
            :show-selected="false"
            :settings="{
              persistenceKey:
                'rag_admin_table_documents_document-manager-list'
            }"
            :refresh-config="{ refresh }"
          >
            <template #suffix>
              <Space class="header-actions">
                <ApButton type="primary" @click="uploadModal.open()"
                  >添加文档</ApButton
                >
                <ApButton
                  danger
                  type="primary"
                  :disabled="ingesting"
                  @click="confirmForceRebuildIndex"
                >
                  强制重建索引
                </ApButton>
              </Space>
            </template>
          </TableTopActionBar>
        </template>
      </AgGrid>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { h, ref } from 'vue';
  import dayjs from 'dayjs';
  import { useRoute } from 'vue-router';
  import { Space, message } from '@aplus-frontend/antdv';
  import {
    AgGrid,
    ApButton,
    ApModal,
    ApTag,
    usePageListAgGrid,
    type AgGridColumnType
  } from '@aplus-frontend/ui';
  import {
    TableTopActionBar,
    useDocumentPreviewModal,
    useRowClickAction
  } from '@aplus-sql/ui-kit';
  import {
    deleteDocument,
    getDocumentPreviewFile,
    ingestDocuments,
    pageDocumentsGrid,
    type RagDocumentItem
  } from '@/api/knowledge-qa/documents';
  import { useDocumentMetadataModal } from './sections/document-metadata-modal/use-document-metadata-modal';
  import { useDocumentUploadModal } from './sections/document-upload-modal/use-document-upload-modal';
  import { ThemeColor } from '@/config/theme-color-token';

  const route = useRoute();
  const ingesting = ref(false);
  const { onRowClick, getPointerRowClassName, clickAction } =
    useRowClickAction('documents');
  const previewModal = useDocumentPreviewModal<RagDocumentItem>({
    loadFile: (item) => getDocumentPreviewFile(item.id)
  });
  const uploadModal = useDocumentUploadModal({ onUploaded: refresh });
  const metadataModal = useDocumentMetadataModal({ onSaved: refresh });
  const statusValueEnum = {
    ready: { text: 'ready', color: ThemeColor.Green },
    failed: { text: 'failed', color: ThemeColor.Red }
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
          allowClear: true
        }
      }
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
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                previewModal.open(record);
              }
            },
            () => record.fileName || '-'
          ),
          h('div', { class: 'muted ' }, record.sourcePath || '-'),
          record.error ? h('div', { class: 'error-text' }, record.error) : null
        ])
    },
    {
      title: '扩展名',
      key: 'fileType',
      dataIndex: 'fileType',
      width: 100,
      hideInSearch: true
    },
    {
      title: 'type',
      key: 'type',
      dataIndex: 'type',
      width: 120,
      hideInSearch: true,
      customRender: ({ record }) => record.type || '-'
    },
    {
      title: 'tag',
      key: 'tag',
      dataIndex: 'tag',
      minWidth: 160,
      hideInSearch: true,
      customRender: ({ record }) => record.tag || '-'
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
          allowClear: true
        }
      },
      customRender: ({ record }) =>
        h(ApTag, {
          text: record.status || '-',
          color: record.status === 'failed' ? ThemeColor.Red : ThemeColor.Green
        })
    },
    {
      title: '片段数',
      key: 'chunkCount',
      dataIndex: 'chunkCount',
      width: 100,
      hideInSearch: true,
      customRender: ({ record }) =>
        record.actualChunkCount ?? record.chunkCount ?? '-'
    },
    {
      title: '大小',
      key: 'fileSize',
      dataIndex: 'fileSize',
      width: 100,
      hideInSearch: true,
      customRender: ({ record }) => formatSize(record.fileSize)
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      width: 170,
      hideInSearch: true,
      customRender: ({ record }) => formatTime(record.updatedAt)
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 180,
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
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                metadataModal.open(record);
              }
            },
            {
              ...clickAction({ text: '切片实况' })
            },
            {
              text: '删除',
              color: 'error',
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                remove(record);
              }
            }
          ]
        };
      }
    }
  ];

  const [gridProps, { reload }] = usePageListAgGrid({
    api: pageDocumentsGrid,
    rowKey: 'id',
    onRowClicked(record, event) {
      onRowClick(event, {
        query: {
          ...route.query,
          drawer: 'document-chunks',
          drawerCode: record.id
        },
        replace: Boolean(route.query.drawer)
      });
    },
    rowClassName: getPointerRowClassName(),
    rowHeight: 58,
    isShowRowSelection: false,
    adaptive: true,
    searchForm: {
      colon: false
    },
    wrapperStyle: {
      height: '100%'
    },
    scroll: {
      x: 1280
    }
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

  function confirmForceRebuildIndex() {
    ApModal.confirm({
      title: '确认强制重建索引？',
      content:
        '请确认文档已准备好。本次操作将重建全部文档索引，耗时较长，请耐心等待。',
      okText: '确认重建',
      cancelText: '取消',
      onOk() {
        return runIngest(true);
      }
    });
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
      }
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

<style scoped>
  .file-name-link {
    max-width: 100%;
    height: auto;
    padding: 0;
    font-weight: 700;
    line-height: 20px;
    text-align: left;
    white-space: normal;
  }
</style>
