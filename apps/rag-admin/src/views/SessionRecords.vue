<template>
  <section class="page split-page">
    <div class="list-pane">
      <header class="page-header compact">
        <div>
          <h1>消息对话记录</h1>
          <p>按会话查看用户提问与助手回答。</p>
        </div>
        <button class="primary-btn" type="button" :disabled="loading" @click="refresh">
          刷新
        </button>
      </header>

      <form class="toolbar" @submit.prevent="search">
        <label>
          渠道
          <input v-model="filters.channel" placeholder="http / wecom" />
        </label>
        <label>
          用户
          <input v-model="filters.userId" placeholder="user id" />
        </label>
        <label>
          关键词
          <input v-model="filters.keyword" placeholder="会话 / 消息" />
        </label>
        <button class="primary-btn" type="submit">查询</button>
      </form>

      <div v-if="error" class="inline-error">{{ error }}</div>

      <div class="session-list">
        <button
          v-for="item in sessions"
          :key="String(item.id)"
          class="session-item"
          :class="{ selected: selected?.id === item.id }"
          type="button"
          @click="select(item)"
        >
          <div class="session-title">
            <span>{{ item.channel }}</span>
            <span>{{ item.messageCount }} 条</span>
          </div>
          <div class="muted">{{ item.conversationId || item.sessionKey }}</div>
          <div class="session-preview">
            {{ item.latestMessage?.content || '暂无消息' }}
          </div>
          <div class="muted">{{ formatTime(item.lastActiveAt) }}</div>
        </button>
        <div v-if="!loading && sessions.length === 0" class="empty">暂无会话</div>
        <div v-if="loading" class="empty">加载中...</div>
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
    </div>

    <aside class="detail-pane">
      <div v-if="!selected" class="state">选择一个会话查看消息详情</div>
      <template v-else>
        <header class="detail-header">
          <div>
            <h2>{{ selected.conversationId || selected.sessionKey }}</h2>
            <p>{{ selected.channel }} · {{ selected.userId || '未知用户' }}</p>
          </div>
        </header>
        <div class="messages">
          <div
            v-for="message in messages"
            :key="String(message.id)"
            class="message"
            :class="message.role"
          >
            <div class="message-meta">
              <span>{{ message.role === 'assistant' ? '助手' : '用户' }}</span>
              <span>{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
          <div v-if="messageLoading" class="empty">消息加载中...</div>
        </div>
      </template>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import {
  listSessionMessages,
  pageSessions,
  type RagMessageItem,
  type RagSessionItem,
} from '@/api/rag-admin';

const filters = reactive({ channel: '', userId: '', keyword: '' });
const sessions = ref<RagSessionItem[]>([]);
const messages = ref<RagMessageItem[]>([]);
const selected = ref<RagSessionItem | null>(null);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const messageLoading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const result = await pageSessions({
      page: page.value,
      pageSize,
      channel: filters.channel || undefined,
      userId: filters.userId || undefined,
      keyword: filters.keyword || undefined,
    });
    sessions.value = result.list;
    total.value = result.total;
    if (selected.value && !sessions.value.some((item) => item.id === selected.value?.id)) {
      selected.value = null;
      messages.value = [];
    }
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

function go(nextPage: number) {
  page.value = nextPage;
  void load();
}

async function select(item: RagSessionItem) {
  selected.value = item;
  messageLoading.value = true;
  try {
    messages.value = await listSessionMessages(item.id);
  } finally {
    messageLoading.value = false;
  }
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

onMounted(load);
</script>
