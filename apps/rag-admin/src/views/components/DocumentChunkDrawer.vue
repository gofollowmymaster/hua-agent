<template>
  <ApDrawer
    v-model:open="open"
    title="切片实况"
    width="720"
    destroy-on-close
    @close="close"
  >
    <template v-if="documentItem">
      <section class="chunk-summary">
        <div>
          <h2>{{ documentItem.fileName || '-' }}</h2>
          <p>{{ documentItem.sourcePath || '-' }}</p>
        </div>
        <Space>
          <ApTag
            :text="documentItem.status || '-'"
            :color="documentItem.status === 'failed' ? '#f04438' : '#12b76a'"
          />
          <ApTag
            :text="`${documentItem.actualChunkCount ?? documentItem.chunkCount ?? 0} 个切片`"
            color="#1677ff"
          />
        </Space>
      </section>

      <Alert v-if="errorText" class="chunk-alert" type="error" show-icon :message="errorText" />

      <Spin :spinning="loading">
        <Empty
          v-if="!loading && !errorText && chunks.length === 0"
          description="暂无切片"
        />
        <div v-else-if="!errorText" class="chunk-list">
          <article v-for="chunk in chunks" :key="String(chunk.id)" class="chunk-card">
            <header class="chunk-card-header">
              <span>#{{ chunk.chunkIndex }}</span>
              <span>{{ formatTime(chunk.createdAt) }}</span>
            </header>
            <pre class="chunk-content">{{ chunk.content }}</pre>
            <pre class="chunk-metadata">{{ formatMetadata(chunk.metadata) }}</pre>
          </article>
        </div>
      </Spin>

      <Pagination
        v-if="total > pageSize"
        class="chunk-pagination"
        :current="page"
        :page-size="pageSize"
        :total="total"
        :show-size-changer="false"
        @change="changePage"
      />
    </template>
  </ApDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { Alert, Empty, Pagination, Space, Spin } from '@aplus-frontend/antdv';
import { ApDrawer, ApTag } from '@aplus-frontend/ui';
import {
  pageDocumentChunks,
  type RagDocumentChunkItem,
  type RagDocumentItem,
} from '@/api/rag-admin';

const open = ref(false);
const loading = ref(false);
const errorText = ref('');
const documentItem = ref<RagDocumentItem | null>(null);
const chunks = ref<RagDocumentChunkItem[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

async function show(item: RagDocumentItem) {
  open.value = true;
  documentItem.value = item;
  page.value = 1;
  chunks.value = [];
  await loadChunks();
}

async function loadChunks() {
  if (!documentItem.value) return;

  loading.value = true;
  errorText.value = '';
  try {
    const result = await pageDocumentChunks(documentItem.value.id, {
      page: page.value,
      pageSize: pageSize.value,
    });
    chunks.value = result.list;
    total.value = result.total;
    page.value = result.page;
    pageSize.value = result.pageSize;
  } catch (error) {
    console.error(error);
    chunks.value = [];
    total.value = 0;
    errorText.value = '切片加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

function changePage(nextPage: number) {
  page.value = nextPage;
  loadChunks();
}

function close() {
  documentItem.value = null;
  chunks.value = [];
  errorText.value = '';
  total.value = 0;
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

function formatMetadata(value: Record<string, unknown>) {
  return JSON.stringify(value || {}, null, 2);
}

defineExpose({ show });
</script>

<style scoped>
.chunk-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.chunk-summary h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.chunk-summary p {
  margin: 4px 0 0;
  color: #667085;
  line-height: 20px;
  word-break: break-all;
}

.chunk-alert {
  margin-bottom: 12px;
}

.chunk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chunk-card {
  border: 1px solid #eaecf0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.chunk-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  color: #667085;
  background: #f9fafb;
  font-size: 12px;
}

.chunk-card-header span:first-child {
  color: #344054;
  font-weight: 600;
}

.chunk-content,
.chunk-metadata {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.chunk-content {
  padding: 12px;
  color: #101828;
  line-height: 20px;
}

.chunk-metadata {
  border-top: 1px solid #eaecf0;
  padding: 10px 12px;
  color: #475467;
  background: #fcfcfd;
  font-size: 12px;
  line-height: 18px;
}

.chunk-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
