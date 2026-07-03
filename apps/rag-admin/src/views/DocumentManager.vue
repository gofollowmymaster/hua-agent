<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>文档管理</h1>
        <p>查看已索引文档，删除索引，或触发 raw 目录重新入库。</p>
      </div>
      <div class="header-actions">
        <button class="primary-btn" type="button" :disabled="loading" @click="refresh">
          刷新
        </button>
        <button class="danger-btn" type="button" :disabled="ingesting" @click="runIngest(true)">
          强制重建索引
        </button>
      </div>
    </header>

    <form class="toolbar" @submit.prevent="search">
      <label>
        关键词
        <input v-model="filters.keyword" placeholder="文件名 / 路径" />
      </label>
      <label>
        状态
        <input v-model="filters.status" placeholder="ready / failed" />
      </label>
      <button class="primary-btn" type="submit">查询</button>
      <button class="plain-btn" type="button" @click="reset">重置</button>
    </form>

    <div v-if="error" class="inline-error">{{ error }}</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>文件名</th>
            <th>类型</th>
            <th>状态</th>
            <th>片段数</th>
            <th>大小</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7">加载中...</td>
          </tr>
          <tr v-else-if="documents.length === 0">
            <td colspan="7">暂无文档</td>
          </tr>
          <tr v-for="item in documents" :key="String(item.id)">
            <td>
              <div class="strong">{{ item.fileName }}</div>
              <div class="muted path">{{ item.sourcePath }}</div>
              <div v-if="item.error" class="error-text">{{ item.error }}</div>
            </td>
            <td>{{ item.fileType }}</td>
            <td>
              <span class="status" :class="item.status">{{ item.status }}</span>
            </td>
            <td>{{ item.actualChunkCount ?? item.chunkCount }}</td>
            <td>{{ formatSize(item.fileSize) }}</td>
            <td>{{ formatTime(item.updatedAt) }}</td>
            <td>
              <button class="link-danger" type="button" @click="remove(item)">
                删除索引
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <button class="plain-btn" type="button" :disabled="page <= 1" @click="go(page - 1)">
        上一页
      </button>
      <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
      <button
        class="plain-btn"
        type="button"
        :disabled="page * pageSize >= total"
        @click="go(page + 1)"
      >
        下一页
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import {
  deleteDocument,
  ingestDocuments,
  pageDocuments,
  type RagDocumentItem,
} from '@/api/rag-admin';

const filters = reactive({ keyword: '', status: '' });
const documents = ref<RagDocumentItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const ingesting = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const result = await pageDocuments({
      page: page.value,
      pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
    });
    documents.value = result.list;
    total.value = result.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

function refresh() {
  void load();
}

function search() {
  page.value = 1;
  void load();
}

function reset() {
  filters.keyword = '';
  filters.status = '';
  page.value = 1;
  void load();
}

function go(nextPage: number) {
  page.value = nextPage;
  void load();
}

async function runIngest(force: boolean) {
  ingesting.value = true;
  error.value = '';
  try {
    await ingestDocuments(force);
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    ingesting.value = false;
  }
}

async function remove(item: RagDocumentItem) {
  if (!window.confirm(`确认删除 ${item.fileName} 的索引？`)) return;
  await deleteDocument(item.id);
  await load();
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

onMounted(load);
</script>
