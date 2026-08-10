<template>
  <section class="page agent-demo-page">
    <div class="agent-demo-actions">
      <ApButton type="primary" @click="startNewSession">新建会话</ApButton>
      <ApButton v-if="busy" @click="stopChat">停止</ApButton>
      <ApButton :disabled="busy && messages.length === 0" @click="clearChat">
        清空
      </ApButton>
    </div>

    <div class="agent-demo-workspace">
      <aside class="agent-demo-history">
        <div class="agent-demo-history-head">
          <div>
            <h2>历史会话</h2>
            <p>{{ historyLoading ? '加载中' : `${sessions.length} 个会话` }}</p>
          </div>
          <ApButton :disabled="historyLoading" @click="loadSessions"
            >刷新</ApButton
          >
        </div>

        <div class="agent-demo-history-list">
          <button
            v-for="session in sessions"
            :key="String(session.id)"
            type="button"
            class="agent-demo-history-item"
            :class="{ active: String(session.id) === selectedSessionId }"
            @click="selectSession(session)"
          >
            <span class="agent-demo-history-title">
              {{
                session.latestMessage?.content ||
                session.conversationId ||
                '未命名会话'
              }}
            </span>
            <span class="agent-demo-history-meta">
              {{ session.messageCount }} 条 ·
              {{ formatTime(session.lastActiveAt) }}
            </span>
          </button>

          <div
            v-if="!historyLoading && sessions.length === 0"
            class="agent-demo-history-empty"
          >
            暂无历史会话
          </div>
        </div>
      </aside>

      <div class="agent-demo-shell">
        <div
          ref="messagePaneRef"
          class="agent-demo-messages"
          role="log"
          aria-live="polite"
        >
          <div v-if="messages.length === 0" class="agent-demo-empty">
            <h2>开始 Agent 演示</h2>
            <p>Agent 会调用知识库和通用工具，以流式方式返回答案。</p>
          </div>

          <article
            v-for="message in messages"
            :key="message.id"
            class="agent-demo-message"
            :class="`agent-demo-message--${message.role}`"
          >
            <div class="agent-demo-message-role">
              {{ message.role === 'user' ? '你' : 'Agent' }}
            </div>
            <div class="agent-demo-message-body">
              <template
                v-for="(part, index) in message.parts"
                :key="`${message.id}-${index}`"
              >
                <div v-if="part.type === 'text'" class="agent-demo-text">
                  <MdPreview
                    :id="`agent-markdown-${message.id}-${index}`"
                    class="agent-demo-markdown"
                    :model-value="part.text"
                    theme="light"
                    preview-theme="github"
                    no-katex
                  />
                </div>
                <div
                  v-else-if="part.type === 'data-status'"
                  class="agent-demo-status-card"
                >
                  {{ formatStatus(part.data) }}
                </div>
              </template>
            </div>
          </article>
        </div>

        <div v-if="errorMessage" class="agent-demo-error" role="alert">
          <span>{{ errorMessage }}</span>
          <ApButton type="link" @click="clearError">关闭</ApButton>
        </div>

        <AgentComposer
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
  listAgentChatMessages,
  pageAgentChatSessions,
  type AgentChatSessionItem
} from '@/api/business-agent/chat';
import { useUserStore } from '@/stores/modules/user';
import {
  createAgentChatSession,
  createLocalChatId,
  formatStatus,
  formatTime,
  toUiMessages
} from './hooks/use-agent-chat';
import AgentComposer from './sections/agent-composer/index.vue';

const HISTORY_PAGE_SIZE = 20;

const userStore = useUserStore();
const messagePaneRef = ref<HTMLElement>();
const input = ref('');
const sessions = ref<AgentChatSessionItem[]>([]);
const selectedSessionId = ref('');
const historyLoading = ref(false);
const messageLoading = ref(false);
const stopping = ref(false);
const currentChatId = ref(createLocalChatId());
const participantId = computed(
  () =>
    userStore.userInfo.userId ||
    userStore.userInfo.email ||
    userStore.displayName
);
const chat = shallowRef(
  createAgentChatSession(currentChatId.value, participantId.value)
);
let stopPromise: Promise<void> | null = null;
const messages = computed(() => chat.value.messages);
const status = computed(() => chat.value.status);
const error = computed(() => chat.value.error);
const busy = computed(
  () => status.value === 'submitted' || status.value === 'streaming'
);
const canSend = computed(
  () =>
    status.value === 'ready' &&
    !messageLoading.value &&
    input.value.trim().length > 0
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
  messageLoading.value ? '加载历史消息' : statusText.value
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
      channel: 'agent-web',
      conversationType: 'agent-chat'
    };
    if (participantId.value) {
      params.userId = participantId.value;
    }

    const result = await pageAgentChatSessions(params);
    sessions.value = result.list;
  } finally {
    historyLoading.value = false;
  }
}

async function selectSession(session: AgentChatSessionItem) {
  if (busy.value) {
    await stopChat();
  }

  selectedSessionId.value = String(session.id);
  currentChatId.value = session.conversationId || createLocalChatId();
  const nextChat = createAgentChatSession(
    currentChatId.value,
    participantId.value
  );
  messageLoading.value = true;

  try {
    const historyMessages = await listAgentChatMessages(session.id);
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
  chat.value = createAgentChatSession(
    currentChatId.value,
    participantId.value
  );
  input.value = '';
}

function clearError() {
  chat.value.clearError();
}

function syncSelectedSession() {
  const matched = sessions.value.find(
    (session) => session.conversationId === currentChatId.value
  );
  selectedSessionId.value = matched
    ? String(matched.id)
    : selectedSessionId.value;
}

watch(
  messages,
  async () => {
    await nextTick();
    if (messagePaneRef.value) {
      messagePaneRef.value.scrollTop = messagePaneRef.value.scrollHeight;
    }
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
.agent-demo-page {
  gap: 16px;
}

.agent-demo-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.agent-demo-workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  flex: 1 1 auto;
  min-height: 0;
  gap: 16px;
}

.agent-demo-history {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.agent-demo-history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid @border-color;
}

.agent-demo-history-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.agent-demo-history-head p {
  margin: 4px 0 0;
  color: @text-secondary-color;
  font-size: 12px;
}

.agent-demo-history-list {
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px;
  overflow: auto;
}

.agent-demo-history-item {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: @text-primary-color;
  text-align: left;
  cursor: pointer;
}

.agent-demo-history-item:hover {
  background: @fill-hover-color;
}

.agent-demo-history-item.active {
  border-color: @primary-color;
  background: fade(@primary-color, 8%);
}

.agent-demo-history-title,
.agent-demo-history-meta {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-demo-history-title {
  font-weight: 600;
}

.agent-demo-history-meta {
  margin-top: 4px;
  color: @text-secondary-color;
  font-size: 12px;
}

.agent-demo-history-empty {
  padding: 24px 12px;
  color: @text-tertiary-color;
  text-align: center;
}

.agent-demo-shell {
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

.agent-demo-messages {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px;
  overflow: auto;
}

.agent-demo-empty {
  display: grid;
  align-content: center;
  height: 100%;
  min-height: 180px;
  justify-items: center;
  color: @text-secondary-color;
}

.agent-demo-empty h2 {
  margin: 0;
  color: @text-primary-color;
  font-size: 18px;
}

.agent-demo-empty p {
  margin: 6px 0 0;
}

.agent-demo-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.agent-demo-message--user {
  flex-direction: row-reverse;
}

.agent-demo-message-role {
  flex: 0 0 auto;
  width: 44px;
  height: 28px;
  border-radius: 6px;
  background: @fill-hover-color;
  color: @text-secondary-color;
  font-size: 12px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.agent-demo-message--user .agent-demo-message-role {
  background: fade(@primary-color, 12%);
  color: @primary-color;
}

.agent-demo-message-body {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 82%;
}

.agent-demo-text {
  padding: 10px 12px;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.agent-demo-message--user .agent-demo-text {
  background: fade(@primary-color, 6%);
}

.agent-demo-markdown {
  color: @text-primary-color;
}

.agent-demo-status-card {
  margin-bottom: 8px;
  padding: 8px 12px;
  border-left: 2px solid @primary-color;
  background: @fill-bg-color;
  color: @text-secondary-color;
  font-size: 12px;
}

.agent-demo-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid @border-color;
  background: fade(@red-color, 8%);
  color: @red-color;
}

@media (max-width: 900px) {
  .agent-demo-workspace {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .agent-demo-history {
    min-height: 260px;
  }

  .agent-demo-shell {
    min-height: 420px;
  }
}
</style>
