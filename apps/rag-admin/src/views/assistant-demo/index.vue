<template>
  <section class="page assistant-page">
    <div class="assistant-actions">
      <ApButton type="primary" @click="startNewSession">新建会话</ApButton>
      <ApButton v-if="busy" @click="stopChat">停止</ApButton>
      <ApButton :disabled="busy && messages.length === 0" @click="clearChat">
        清空
      </ApButton>
    </div>

    <div class="assistant-workspace">
      <aside class="assistant-history">
        <div class="assistant-history-head">
          <div>
            <h2>历史会话</h2>
            <p>{{ historyLoading ? '加载中' : `${sessions.length} 个会话` }}</p>
          </div>
          <ApButton :disabled="historyLoading" @click="loadSessions"
            >刷新</ApButton
          >
        </div>

        <div class="assistant-history-list">
          <button
            v-for="session in sessions"
            :key="String(session.id)"
            type="button"
            class="assistant-history-item"
            :class="{ active: String(session.id) === selectedSessionId }"
            @click="selectSession(session)"
          >
            <span class="assistant-history-title">
              {{
                session.latestMessage?.content ||
                session.conversationId ||
                '未命名会话'
              }}
            </span>
            <span class="assistant-history-meta">
              {{ session.messageCount }} 条 ·
              {{ formatTime(session.lastActiveAt) }}
            </span>
          </button>

          <div
            v-if="!historyLoading && sessions.length === 0"
            class="assistant-history-empty"
          >
            暂无历史会话
          </div>
        </div>
      </aside>

      <div class="assistant-shell">
        <div
          ref="messagePaneRef"
          class="assistant-messages"
          role="log"
          aria-live="polite"
        >
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
              <template
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${index}`"
              >
                <AssistantReasoning
                  v-if="part.type === 'reasoning'"
                  :state="part.state"
                  :text="part.text"
                />
                <div v-if="part.type === 'text'" class="assistant-text">
                  <MdPreview
                    :id="`rag-markdown-${message.id}-${index}`"
                    class="assistant-markdown"
                    :model-value="part.text"
                    theme="light"
                    preview-theme="github"
                    no-katex
                    @click.capture="handleMarkdownClick"
                  />
                </div>
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

        <AssistantComposer
          v-model="input"
          :busy="busy"
          :can-send="canSend"
          :message-loading="messageLoading"
          :state-text="currentStateText"
          :stopping="stopping"
          @send="send"
          @stop="stopChat"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { ApButton } from '@aplus-frontend/ui';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import {
  listSessionMessages,
  pageSessions,
  type RagSessionItem,
} from '@/api/rag-admin';
import { useUserStore } from '@/stores/modules/user';
import { useDocumentPreviewModal } from '@/components/document-preview-modal/use-document-preview-modal';
import {
  createChatSession,
  createLocalChatId,
  formatStatus,
  formatTime,
  resolvePreviewDocument,
  toUiMessages,
} from './hooks/use-chat';
import AssistantComposer from './sections/assistant-composer/index.vue';
import AssistantReasoning from './sections/assistant-reasoning/index.vue';

const HISTORY_PAGE_SIZE = 20;

const userStore = useUserStore();
const messagePaneRef = ref<HTMLElement>();
const previewModal = useDocumentPreviewModal();
const input = ref('');
const sessions = ref<RagSessionItem[]>([]);
const selectedSessionId = ref('');
const historyLoading = ref(false);
const messageLoading = ref(false);
const stopping = ref(false);
const currentChatId = ref(createLocalChatId());
const participantId = computed(
  () =>
    userStore.userInfo.userId ||
    userStore.userInfo.email ||
    userStore.displayName,
);
const chat = shallowRef(
  createChatSession(currentChatId.value, participantId.value),
);
let stopPromise: Promise<void> | null = null;
const messages = computed(() => chat.value.messages);
const status = computed(() => chat.value.status);
const error = computed(() => chat.value.error);
const busy = computed(
  () => status.value === 'submitted' || status.value === 'streaming',
);
const canSend = computed(
  () =>
    status.value === 'ready' &&
    !messageLoading.value &&
    input.value.trim().length > 0,
);
const errorMessage = computed(() => error.value?.message || '');
const statusText = computed(() => {
  if (stopping.value) return '正在中断';
  if (status.value === 'submitted') return '等待响应';
  if (status.value === 'streaming') return '生成中';
  if (status.value === 'error') return '出错';
  return '就绪';
});
const currentStateText = computed(() =>
  messageLoading.value ? '加载历史消息' : statusText.value,
);

onMounted(() => {
  void loadSessions();
});

async function loadSessions() {
  historyLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: 1,
      pageSize: HISTORY_PAGE_SIZE,
      channel: 'web',
      conversationType: 'rag-chat',
    };
    if (participantId.value) {
      params.userId = participantId.value;
    }

    const result = await pageSessions(params);
    sessions.value = result.list;
  } finally {
    historyLoading.value = false;
  }
}

async function selectSession(session: RagSessionItem) {
  if (busy.value) {
    await stopChat();
  }

  selectedSessionId.value = String(session.id);
  currentChatId.value = session.conversationId || createLocalChatId();
  const nextChat = createChatSession(currentChatId.value, participantId.value);
  messageLoading.value = true;

  try {
    const historyMessages = await listSessionMessages(session.id);
    nextChat.messages = toUiMessages(historyMessages);
    chat.value = nextChat;
    input.value = '';
  } finally {
    messageLoading.value = false;
  }
}

async function send() {
  const text = input.value.trim();
  if (!text || status.value !== 'ready' || messageLoading.value) return;

  input.value = '';
  try {
    await chat.value.sendMessage({ text });
  } finally {
    await loadSessions();
    syncSelectedSession();
  }
}

async function stopChat() {
  if (!busy.value) return;
  if (stopPromise) {
    await stopPromise;
    return;
  }

  stopping.value = true;
  stopPromise = chat.value.stop().finally(() => {
    stopping.value = false;
    stopPromise = null;
  });

  await stopPromise;
}

function clearChat() {
  if (busy.value) {
    void stopChat();
  }
  chat.value.messages = [];
  chat.value.clearError();
}

async function startNewSession() {
  if (busy.value) {
    await stopChat();
  }

  selectedSessionId.value = '';
  currentChatId.value = createLocalChatId();
  chat.value = createChatSession(currentChatId.value, participantId.value);
  input.value = '';
}

function clearError() {
  chat.value.clearError();
}

function syncSelectedSession() {
  const matched = sessions.value.find(
    (session) => session.conversationId === currentChatId.value,
  );
  selectedSessionId.value = matched
    ? String(matched.id)
    : selectedSessionId.value;
}

function handleMarkdownClick(event: MouseEvent) {
  const link = (event.target as HTMLElement | null)?.closest('a');
  if (!link) return;

  const previewItem = resolvePreviewDocument({
    href: link.getAttribute('href') || '',
    label: link.textContent || '',
  });
  if (!previewItem) return;

  event.preventDefault();
  previewModal.open(previewItem);
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

<style lang="less" scoped>
.assistant-page {
  gap: 16px;
}

.assistant-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.assistant-workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  flex: 1 1 auto;
  min-height: 0;
  gap: 16px;
}

.assistant-history {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.assistant-history-head {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid @border-color;
}

.assistant-history-head h2 {
  margin: 0;
  color: @text-primary-color;
  font-size: 16px;
  line-height: 22px;
}

.assistant-history-head p {
  margin: 4px 0 0;
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
}

.assistant-history-list {
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px;
  overflow: auto;
}

.assistant-history-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 70px;
  margin: 0 0 6px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: @text-primary-color;
  text-align: left;
  cursor: pointer;
  gap: 6px;
}

.assistant-history-item:hover {
  background: @fill-hover-color;
}

.assistant-history-item.active {
  border-color: @green-color;
  background: @green-disabled-color;
}

.assistant-history-title {
  display: -webkit-box;
  overflow: hidden;
  font-weight: 700;
  line-height: 20px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.assistant-history-meta {
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
}

.assistant-history-empty {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: @text-secondary-color;
}

.assistant-shell {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.assistant-messages {
  flex: 1 1 auto;
  min-height: 0;
  padding: 20px;
  overflow: auto;
}

.assistant-empty {
  display: grid;
  min-height: 280px;
  place-content: center;
  text-align: center;
}

.assistant-empty h2 {
  margin: 0;
  color: @text-primary-color;
  font-size: 20px;
  line-height: 28px;
}

.assistant-empty p {
  margin: 8px 0 0;
  color: @text-secondary-color;
}

.assistant-message {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.assistant-message-role {
  color: @text-secondary-color;
  font-weight: 700;
  line-height: 32px;
}

.assistant-message-body {
  max-width: 840px;
}

.assistant-message--user .assistant-message-body {
  justify-self: end;
}

.assistant-message--assistant .assistant-message-body {
  justify-self: start;
}

.assistant-text {
  margin: 0 0 8px;
  padding: 10px 12px;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @fill-bg-color;
  color: @text-primary-color;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.assistant-markdown :deep(.md-editor-preview-wrapper) {
  padding: 0;
  background: transparent;
}

.assistant-markdown :deep(.md-editor-preview) {
  color: inherit;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.assistant-markdown :deep(.md-editor-preview > :first-child) {
  margin-top: 0;
}

.assistant-markdown :deep(.md-editor-preview > :last-child) {
  margin-bottom: 0;
}

.assistant-markdown :deep(.md-editor-preview p),
.assistant-markdown :deep(.md-editor-preview ul),
.assistant-markdown :deep(.md-editor-preview ol),
.assistant-markdown :deep(.md-editor-preview blockquote),
.assistant-markdown :deep(.md-editor-preview pre),
.assistant-markdown :deep(.md-editor-preview table) {
  margin-bottom: 10px;
}

.assistant-markdown :deep(.md-editor-preview pre),
.assistant-markdown :deep(.md-editor-preview table) {
  max-width: 100%;
  overflow-x: auto;
}

.assistant-markdown :deep(.md-editor-preview a) {
  color: @blue-hover-color;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.assistant-markdown :deep(.md-editor-preview a:hover) {
  color: @primary-active-color;
}

.assistant-message--user .assistant-text {
  border-color: @green-color;
  background: @green-disabled-color;
}

.assistant-status-card {
  display: inline-flex;
  max-width: 100%;
  margin: 0 0 8px;
  padding: 5px 8px;
  border: 1px solid @border-color;
  border-radius: 6px;
  background: @fill-hover-color;
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.assistant-error {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-top: 1px solid fade(@red-color, 30%);
  background: @red-disabled-color;
  color: @red-color;
  gap: 12px;
}

@media (max-width: 900px) {
  .assistant-workspace {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .assistant-history {
    min-height: 260px;
  }

  .assistant-message {
    grid-template-columns: 52px minmax(0, 1fr);
  }
}
</style>
