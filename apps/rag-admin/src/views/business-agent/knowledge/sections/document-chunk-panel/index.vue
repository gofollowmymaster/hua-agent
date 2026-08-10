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
              :text="documentItem.category || '-'"
              :color="ThemeColor.Blue"
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
  getAgentKnowledgeDocument,
  pageAgentKnowledgeDocumentChunks,
  type AgentKnowledgeChunkItem,
  type AgentKnowledgeDocumentItem
} from '@/api/business-agent/knowledge';
import { useLayoutDrawer } from '@/layouts/layout-drawer/use-layout-drawer';
import { ThemeColor } from '@/config/theme-color-token';

const props = defineProps<{
  drawerCode: string | number;
}>();

const layoutDrawer = useLayoutDrawer();
const loading = ref(false);
const errorText = ref('');
const documentItem = ref<AgentKnowledgeDocumentItem | null>(null);
const chunks = ref<AgentKnowledgeChunkItem[]>([]);
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
    immediate: true
  }
);

async function loadPanel() {
  loading.value = true;
  errorText.value = '';
  documentItem.value = null;

  try {
    documentItem.value = await getAgentKnowledgeDocument(props.drawerCode);
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
    const result = await pageAgentKnowledgeDocumentChunks(props.drawerCode, {
      page: page.value,
      pageSize: pageSize.value
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

function getChunkKey(chunk: AgentKnowledgeChunkItem) {
  return String(chunk.id);
}

function isChunkExpanded(chunk: AgentKnowledgeChunkItem) {
  return expandedChunkKeys.value.has(getChunkKey(chunk));
}

function toggleChunk(chunk: AgentKnowledgeChunkItem) {
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
}

.chunk-card-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.chunk-chevron {
  display: inline-block;
  transition: transform 0.2s ease;
}

.chunk-chevron.expanded {
  transform: rotate(90deg);
}

.chunk-card-body {
  padding: 12px;
}

.chunk-content {
  margin: 0;
  color: @text-primary-color;
  font-size: 13px;
  line-height: 20px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chunk-metadata {
  margin: 12px 0 0;
  padding: 10px;
  border-radius: 6px;
  background: @fill-bg-color;
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chunk-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
