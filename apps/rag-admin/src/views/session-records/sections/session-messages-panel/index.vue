<template>
  <section class="session-messages-panel">
    <header class="panel-header">
      <div>
        <h2>消息记录</h2>
        <p>会话 ID：{{ drawerCode }}</p>
      </div>
      <ApButton type="text" @click="close">关闭</ApButton>
    </header>

    <Alert
      v-if="errorText"
      class="message-alert"
      type="error"
      show-icon
      :message="errorText"
    />
    <Spin v-else :spinning="loading">
      <Empty
        v-if="!loading && messages.length === 0"
        description="暂无消息"
      />
      <div v-else-if="!loading" class="message-list">
        <article
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
        </article>
      </div>
    </Spin>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { Alert, Empty, Spin } from '@aplus-frontend/antdv';
import { ApButton } from '@aplus-frontend/ui';
import { listSessionMessages, type RagMessageItem } from '@/api/rag-admin';
import { useLayoutDrawer } from '@/layouts/layout-drawer/use-layout-drawer';

const props = defineProps<{
  drawerCode: string | number;
}>();

const layoutDrawer = useLayoutDrawer();
const loading = ref(false);
const errorText = ref('');
const messages = ref<RagMessageItem[]>([]);

watch(
  () => props.drawerCode,
  () => {
    void loadMessages();
  },
  {
    immediate: true,
  },
);

async function loadMessages() {
  loading.value = true;
  errorText.value = '';
  messages.value = [];

  try {
    messages.value = await listSessionMessages(props.drawerCode);
  } catch (error) {
    console.error(error);
    errorText.value = '消息加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

function close() {
  layoutDrawer.close();
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
</script>

<style scoped>
.session-messages-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.panel-header p {
  margin: 4px 0 0;
  color: #667085;
  line-height: 20px;
  word-break: break-all;
}

.message-alert {
  margin-bottom: 12px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  border: 1px solid #eaecf0;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
}

.message.assistant {
  border-color: #d0d5dd;
  background: #f9fafb;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #667085;
  font-size: 12px;
}

.message-content {
  margin-top: 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: #101828;
  line-height: 22px;
}
</style>
