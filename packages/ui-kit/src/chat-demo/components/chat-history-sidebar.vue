<template>
  <aside class="chat-demo-history">
    <div class="chat-demo-history-head">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ loading ? '加载中' : `${sessions.length} 个会话` }}</p>
      </div>
      <button
        type="button"
        class="chat-demo-refresh"
        :disabled="loading"
        @click="emit('refresh')"
      >
        刷新
      </button>
    </div>

    <div class="chat-demo-history-list">
      <button
        v-for="session in sessions"
        :key="String(session.id)"
        type="button"
        class="chat-demo-history-item"
        :class="{ active: String(session.id) === selectedId }"
        @click="emit('select', session)"
      >
        <span class="chat-demo-history-title">
          {{
            session.latestMessage?.content ||
            session.conversationId ||
            '未命名会话'
          }}
        </span>
        <span class="chat-demo-history-meta">
          {{ session.messageCount }} 条 ·
          {{ displayTime(session.lastActiveAt) }}
        </span>
      </button>

      <div
        v-if="!loading && sessions.length === 0"
        class="chat-demo-history-empty"
      >
        暂无历史会话
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ChatDemoSessionItem } from '../types';

const props = defineProps<{
  sessions: ChatDemoSessionItem[];
  selectedId: string;
  loading: boolean;
  title?: string;
  timeFormatter?: (value?: string) => string;
}>();

const emit = defineEmits<{
  (event: 'refresh'): void;
  (event: 'select', session: ChatDemoSessionItem): void;
}>();

function displayTime(value?: string) {
  return props.timeFormatter
    ? props.timeFormatter(value)
    : value
      ? formatFallbackTime(value)
      : '-';
}

function formatFallbackTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}
</script>

<style lang="less" scoped>
.chat-demo-history {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 8px;
  background: var(--agent-chat-card-bg-color, #fff);
}

.chat-demo-history-head {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--agent-chat-border-color, #d9d9d9);
}

.chat-demo-history-head h2 {
  margin: 0;
  color: var(--agent-chat-text-primary-color, #1f2329);
  font-size: 16px;
  line-height: 22px;
}

.chat-demo-history-head p {
  margin: 4px 0 0;
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 12px;
  line-height: 18px;
}

.chat-demo-refresh {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 6px;
  background: var(--agent-chat-card-bg-color, #fff);
  color: var(--agent-chat-text-primary-color, #1f2329);
  font-size: 13px;
  cursor: pointer;
}

.chat-demo-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-demo-history-list {
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px;
  overflow: auto;
}

.chat-demo-history-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 70px;
  margin: 0 0 6px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--agent-chat-text-primary-color, #1f2329);
  text-align: left;
  cursor: pointer;
  gap: 6px;
}

.chat-demo-history-item:hover {
  background: var(--agent-chat-fill-hover-color, #fafafa);
}

.chat-demo-history-item.active {
  border-color: var(--agent-chat-green-color, #52c41a);
  background: var(--agent-chat-green-disabled-color, #f6ffed);
}

.chat-demo-history-title {
  display: -webkit-box;
  overflow: hidden;
  font-weight: 700;
  line-height: 20px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.chat-demo-history-meta {
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 12px;
  line-height: 18px;
}

.chat-demo-history-empty {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: var(--agent-chat-text-secondary-color, #646a73);
}

@media (width <= 900px) {
  .chat-demo-history {
    min-height: 260px;
  }
}
</style>
