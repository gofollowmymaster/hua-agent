<template>
  <section class="page assistant-page">
    <header class="page-header assistant-header">
      <div>
        <h1>问答助手</h1>
        <p>基于当前 RAG 文档索引的 AGUI 协议演示会话。</p>
      </div>
      <div class="assistant-actions">
        <ApButton type="primary" @click="startNewSession">新建会话</ApButton>
        <ApButton v-if="busy" @click="stopChat">停止</ApButton>
        <ApButton :disabled="busy && messages.length === 0" @click="clearChat">
          清空
        </ApButton>
      </div>
    </header>

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
                  :part="part"
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
    <DocumentPreviewModal ref="previewModalRef" />
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ApButton } from '@aplus-frontend/ui';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { getToken } from '@/auth/token';
import {
  listSessionMessages,
  pageSessions,
  type RagMessageItem,
  type RagSessionItem,
} from '@/api/rag-admin';
import { useUserStore } from '@/stores/modules/user';
import AssistantComposer from './components/AssistantComposer.vue';
import AssistantReasoning from './components/AssistantReasoning.vue';
import DocumentPreviewModal from './components/DocumentPreviewModal.vue';

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
interface PreviewDocumentItem {
  id: string | number;
  fileName: string;
  fileType: string;
}

const HISTORY_PAGE_SIZE = 20;

const userStore = useUserStore();
const messagePaneRef = ref<HTMLElement>();
const previewModalRef = ref<InstanceType<typeof DocumentPreviewModal>>();
const input = ref('');
const sessions = ref<RagSessionItem[]>([]);
const selectedSessionId = ref('');
const historyLoading = ref(false);
const messageLoading = ref(false);
const stopping = ref(false);
const currentChatId = ref(createLocalChatId());
const chat = shallowRef(createChat(currentChatId.value));
let stopPromise: Promise<void> | null = null;

const participantId = computed(
  () =>
    userStore.userInfo.userId ||
    userStore.userInfo.email ||
    userStore.displayName,
);
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
  const nextChat = createChat(currentChatId.value);
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
  chat.value = createChat(currentChatId.value);
  input.value = '';
}

function clearError() {
  chat.value.clearError();
}

function createChat(id: string) {
  return new Chat<RagAssistantMessage>({
    id,
    transport: new DefaultChatTransport({
      api: '/ai/rag/chat',
      headers: () => {
        const token = userStore.token || getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        return headers;
      },
      body: () => ({
        participantId: participantId.value,
      }),
    }),
  });
}

function toUiMessages(
  historyMessages: RagMessageItem[],
): RagAssistantMessage[] {
  return historyMessages
    .filter(
      (message) => message.role === 'user' || message.role === 'assistant',
    )
    .map((message) => ({
      id: String(message.id),
      role: message.role as 'user' | 'assistant',
      parts: [{ type: 'text', text: message.content }],
    }));
}

function syncSelectedSession() {
  const matched = sessions.value.find(
    (session) => session.conversationId === currentChatId.value,
  );
  selectedSessionId.value = matched
    ? String(matched.id)
    : selectedSessionId.value;
}

function createLocalChatId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `rag-chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatStatus(data: unknown) {
  if (!data || typeof data !== 'object') return '状态更新';

  const statusData = data as RagStatusData;
  if (statusData.chunks != null) {
    return `${statusData.message || '状态更新'} · ${statusData.chunks} 个片段`;
  }
  return statusData.message || statusData.stage || '状态更新';
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
  previewModalRef.value?.show(previewItem);
}

function resolvePreviewDocument(segment: { href: string; label: string }) {
  const match = segment.href.match(
    /^\/ai\/rag\/admin\/documents\/([^/]+)\/preview$/,
  );
  if (!match) return null;

  const fileName = segment.label.trim() || '引用文件';
  return {
    id: decodeURIComponent(match[1]),
    fileName,
    fileType: inferFileType(fileName),
  } satisfies PreviewDocumentItem;
}

function inferFileType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && extension !== fileName.toLowerCase() ? extension : '';
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-';
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
