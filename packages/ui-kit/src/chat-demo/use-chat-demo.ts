import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import type {
  ChatDemoAdapter,
  ChatDemoMessage,
  ChatDemoSessionItem,
} from './types';

const HISTORY_PAGE_SIZE = 20;

/** 管理共享聊天 Demo 的会话、消息、发送、停止和新建状态。 */
export function useChatDemo(
  adapter: ChatDemoAdapter,
) {
  const participantId = adapter.getParticipantId();
  const messagePaneRef = ref<HTMLElement>();
  const input = ref('');
  const sessions = ref<ChatDemoSessionItem[]>([]);
  const selectedSessionId = ref('');
  const historyLoading = ref(false);
  const messageLoading = ref(false);
  const stopping = ref(false);
  const currentChatId = ref(createLocalChatId());
  const chat = shallowRef(
    adapter.createSession(currentChatId.value, participantId),
  );
  let stopPromise: Promise<void> | null = null;

  const messages = computed<ChatDemoMessage[]>(() => chat.value.messages);
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
  const autoScrollKey = computed(() => {
    const latest = messages.value[messages.value.length - 1];
    return latest ? String(latest.id) : '';
  });

  onMounted(() => {
    void loadSessions();
  });

  async function loadSessions() {
    historyLoading.value = true;
    try {
      const result = await adapter.pageSessions({
        page: 1,
        pageSize: HISTORY_PAGE_SIZE,
        channel: adapter.channel,
        conversationType: adapter.conversationType,
        userId: participantId,
      });
      sessions.value = result.list;
    } finally {
      historyLoading.value = false;
    }
  }

  async function selectSession(session: ChatDemoSessionItem) {
    if (busy.value) {
      await stopChat();
    }

    selectedSessionId.value = String(session.id);
    currentChatId.value = session.conversationId || createLocalChatId();
    const nextChat = adapter.createSession(currentChatId.value, participantId);
    messageLoading.value = true;

    try {
      const historyMessages = await adapter.listMessages(session.id);
      nextChat.messages = adapter.toUiMessages(historyMessages);
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
    chat.value = adapter.createSession(currentChatId.value, participantId);
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

  async function scrollToBottom() {
    await nextTick();
    if (messagePaneRef.value) {
      messagePaneRef.value.scrollTop = messagePaneRef.value.scrollHeight;
    }
  }

  watch(messages, scrollToBottom, { deep: true });

  return {
    input,
    sessions,
    selectedSessionId,
    historyLoading,
    messageLoading,
    stopping,
    messages,
    status,
    error,
    busy,
    canSend,
    errorMessage,
    statusText,
    currentStateText,
    autoScrollKey,
    messagePaneRef,
    loadSessions,
    selectSession,
    send,
    stopChat,
    clearChat,
    startNewSession,
    clearError,
    scrollToBottom,
  };
}

function createLocalChatId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `chat-demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
