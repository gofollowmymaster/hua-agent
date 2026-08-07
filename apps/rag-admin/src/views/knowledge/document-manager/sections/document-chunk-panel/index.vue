<template>
  <section class="chunk-panel">
    <Alert
      v-if="errorText"
      class="chunk-alert"
      type="error"
      show-icon
      :message="errorText"
    />
    <Spin v-else :spinning="loading">
      <template v-if="documentItem">
        <section class="chunk-summary">
          <div>
            <h2>{{ documentItem.fileName || '-' }}</h2>
            <p>{{ documentItem.sourcePath || '-' }}</p>
          </div>
          <Space>
            <ApTag
              :text="documentItem.status || '-'"
              :color="
                documentItem.status === 'failed'
                  ? ThemeColor.Red
                  : ThemeColor.Green
              "
            />
            <ApTag
              :text="`${documentItem.actualChunkCount ?? documentItem.chunkCount ?? 0} 个切片`"
              :color="ThemeColor.Blue"
            />
            <ApButton type="text" @click="close">关闭</ApButton>
          </Space>
        </section>

        <Empty v-if="!loading && chunks.length === 0" description="暂无切片" />
        <div v-else-if="!loading" class="chunk-list">
          <article
            v-for="chunk in chunks"
            :key="String(chunk.id)"
            class="chunk-card"
          >
            <header
              class="chunk-card-header"
              role="button"
              tabindex="0"
              :aria-expanded="isChunkExpanded(chunk)"
              @click="toggleChunk(chunk)"
              @keydown.enter.prevent="toggleChunk(chunk)"
              @keydown.space.prevent="toggleChunk(chunk)"
            >
              <span class="chunk-card-title">
                <span
                  class="chunk-chevron"
                  :class="{ expanded: isChunkExpanded(chunk) }"
                >
                  ›
                </span>
                #{{ chunk.chunkIndex }}
              </span>
              <span>{{ formatTime(chunk.createdAt) }}</span>
            </header>
            <div v-if="isChunkExpanded(chunk)" class="chunk-card-body">
              <pre class="chunk-content">{{ chunk.content }}</pre>
              <pre class="chunk-metadata">{{
                formatMetadata(chunk.metadata)
              }}</pre>
            </div>
          </article>
        </div>

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
    </Spin>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { Alert, Empty, Pagination, Space, Spin } from '@aplus-frontend/antdv';
import { ApButton, ApTag } from '@aplus-frontend/ui';
import {
  getDocument,
  pageDocumentChunks,
  type RagDocumentChunkItem,
  type RagDocumentItem,
} from '@/api/rag-admin';
import { useLayoutDrawer } from '@/layouts/layout-drawer/use-layout-drawer';
import { ThemeColor } from '@/config/theme-color-token';

const props = defineProps<{
  drawerCode: string | number;
}>();

const layoutDrawer = useLayoutDrawer();
const loading = ref(false);
const errorText = ref('');
const documentItem = ref<RagDocumentItem | null>(null);
const chunks = ref<RagDocumentChunkItem[]>([]);
const expandedChunkKeys = ref<Set<string>>(new Set());
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);

watch(
  () => props.drawerCode,
  () => {
    page.value = 1;
    chunks.value = [];
    expandedChunkKeys.value = new Set();
    total.value = 0;
    void loadPanel();
  },
  {
    immediate: true,
  },
);

async function loadPanel() {
  loading.value = true;
  errorText.value = '';
  documentItem.value = null;

  try {
    documentItem.value = await getDocument(props.drawerCode);
    await loadChunks();
  } catch (error) {
    console.error(error);
    documentItem.value = null;
    chunks.value = [];
    total.value = 0;
    errorText.value = '文档详情加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

async function loadChunks() {
  loading.value = true;
  errorText.value = '';
  try {
    const result = await pageDocumentChunks(props.drawerCode, {
      page: page.value,
      pageSize: pageSize.value,
    });
    chunks.value = result.list;
    expandedChunkKeys.value = new Set();
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
  layoutDrawer.close();
}

function getChunkKey(chunk: RagDocumentChunkItem) {
  return String(chunk.id);
}

function isChunkExpanded(chunk: RagDocumentChunkItem) {
  return expandedChunkKeys.value.has(getChunkKey(chunk));
}

function toggleChunk(chunk: RagDocumentChunkItem) {
  const key = getChunkKey(chunk);
  const nextKeys = new Set(expandedChunkKeys.value);

  if (nextKeys.has(key)) {
    nextKeys.delete(key);
  } else {
    nextKeys.add(key);
  }

  expandedChunkKeys.value = nextKeys;
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

function formatMetadata(value: Record<string, unknown>) {
  return JSON.stringify(value || {}, null, 2);
}
</script>

<style lang="less" scoped>
.chunk-panel {
  padding: 20px;
}

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
  color: @text-secondary-color;
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
  overflow: hidden;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.chunk-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: @fill-bg-color;
  color: @text-secondary-color;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}

.chunk-card-header:hover {
  background: @fill-hover-color;
}

.chunk-card-header:focus-visible {
  outline: 2px solid @blue-color;
  outline-offset: -2px;
}

.chunk-card-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: @text-secondary-color;
  font-weight: 600;
}

.chunk-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  transition: transform 0.16s ease;
  color: @text-secondary-color;
  font-size: 16px;
  line-height: 14px;
}

.chunk-chevron.expanded {
  transform: rotate(90deg);
}

.chunk-card-body {
  border-top: 1px solid @border-color;
}

.chunk-content,
.chunk-metadata {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-word;
  white-space: pre-wrap;
}

.chunk-content {
  padding: 12px;
  color: @text-primary-color;
  line-height: 20px;
}

.chunk-metadata {
  padding: 10px 12px;
  border-top: 1px solid @border-color;
  background: @fill-disabled-color;
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
}

.chunk-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
