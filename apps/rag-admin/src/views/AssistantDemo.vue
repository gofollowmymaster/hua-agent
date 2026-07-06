<template>
  <section class="page assistant-page">
    <header class="page-header assistant-header">
      <div>
        <h1>问答助手</h1>
        <p>基于当前 RAG 文档索引的 AGUI 协议演示会话。</p>
      </div>
      <div class="assistant-actions">
        <ApButton v-if="busy" @click="stopChat">停止</ApButton>
        <ApButton :disabled="busy && messages.length === 0" @click="clearChat">
          清空
        </ApButton>
      </div>
    </header>

    <div class="assistant-shell">
      <div ref="messagePaneRef" class="assistant-messages" role="log" aria-live="polite">
        <div v-if="messages.length === 0" class="assistant-empty">
          <h2>输入问题开始演示</h2>
          <p>助手会检索已索引文档，并以流式方式返回答案。</p>
        </div>

        <article
          v-for="message in messages"
          :key="message.id"
          class="assistant-message"
          :class="`assistant-message--${message.role}`"
        >
          <div class="assistant-message-role">
            {{ message.role === 'user' ? '你' : '助手' }}
          </div>
          <div class="assistant-message-body">
            <template v-for="(part, index) in message.parts" :key="`${message.id}-${index}`">
              <p v-if="part.type === 'text'" class="assistant-text">
                {{ part.text }}
              </p>
              <div
                v-else-if="part.type === 'data-status'"
                class="assistant-status-card"
              >
                {{ formatStatus(part.data) }}
              </div>
            </template>
          </div>
        </article>
      </div>

      <div v-if="errorMessage" class="assistant-error" role="alert">
        <span>{{ errorMessage }}</span>
        <ApButton type="link" @click="clearError">关闭</ApButton>
      </div>

      <form class="assistant-composer" @submit.prevent="send">
        <textarea
          v-model="input"
          class="assistant-input"
          :disabled="busy"
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          rows="3"
          @keydown="handleInputKeydown"
        />
        <div class="assistant-composer-footer">
          <span class="assistant-state">{{ statusText }}</span>
          <ApButton type="primary" html-type="submit" :disabled="!canSend">
            发送
          </ApButton>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ApButton } from '@aplus-frontend/ui';
import { getToken } from '@/auth/token';
import { useUserStore } from '@/stores/modules/user';

interface RagStatusData {
  stage?: string;
  message?: string;
  chunks?: number;
}

interface RagAssistantDataParts {
  status: RagStatusData;
  [key: string]: unknown;
}

type RagAssistantMessage = UIMessage<unknown, RagAssistantDataParts>;

const userStore = useUserStore();
const messagePaneRef = ref<HTMLElement>();
const input = ref('');

const chat = new Chat<RagAssistantMessage>({
  transport: new DefaultChatTransport({
    api: '/ai/rag/admin/chat',
    headers: () => {
      const token = userStore.token || getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    body: () => ({
      participantId:
        userStore.userInfo.userId ||
        userStore.userInfo.email ||
        userStore.displayName,
    }),
  }),
});

const messages = computed(() => chat.messages);
const status = computed(() => chat.status);
const error = computed(() => chat.error);
const busy = computed(
  () => status.value === 'submitted' || status.value === 'streaming',
);
const canSend = computed(() => status.value === 'ready' && input.value.trim().length > 0);
const errorMessage = computed(() => error.value?.message || '');
const statusText = computed(() => {
  if (status.value === 'submitted') return '已发送';
  if (status.value === 'streaming') return '生成中';
  if (status.value === 'error') return '出错';
  return '就绪';
});

async function send() {
  const text = input.value.trim();
  if (!text || status.value !== 'ready') return;

  input.value = '';
  await chat.sendMessage({ text });
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return;

  event.preventDefault();
  void send();
}

function stopChat() {
  void chat.stop();
}

function clearChat() {
  if (busy.value) {
    void chat.stop();
  }
  chat.messages = [];
  chat.clearError();
}

function clearError() {
  chat.clearError();
}

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';

  const statusData = data as RagStatusData;
  if (statusData.chunks != null) {
    return `${statusData.message || '状态更新'} · ${statusData.chunks} 个片段`;
  }
  return statusData.message || statusData.stage || '状态更新';
}

watch(
  messages,
  async () => {
    await nextTick();
    if (messagePaneRef.value) {
      messagePaneRef.value.scrollTop = messagePaneRef.value.scrollHeight;
    }
  },
  { deep: true },
);
</script>
