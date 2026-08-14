<template>
  <section class="chat-demo-page">
    <div class="chat-demo-actions">
      <button
        type="button"
        class="chat-demo-action is-primary"
        @click="startNewSession"
      >
        新建会话
      </button>
      <button v-if="busy" type="button" class="chat-demo-action" @click="stopChat">
        停止
      </button>
      <button
        type="button"
        class="chat-demo-action"
        :disabled="busy && messages.length === 0"
        @click="clearChat"
      >
        清空
      </button>
    </div>

    <div class="chat-demo-workspace">
      <ChatHistorySidebar
        :sessions="sessions"
        :selected-id="selectedSessionId"
        :loading="historyLoading"
        :title="displayOptions.historyTitle"
        :time-formatter="adapter.formatTime"
        @refresh="loadSessions"
        @select="selectSession"
      />

      <div class="chat-demo-shell">
        <ChatMessageList
          :messages="messages"
          :format-status="adapter.formatStatus"
          :assistant-name="displayOptions.assistantName"
          :user-label="displayOptions.userLabel"
          :empty-title="displayOptions.emptyTitle"
          :empty-description="displayOptions.emptyDescription"
          :auto-scroll-key="autoScrollKey"
          :on-markdown-click="adapter.onMarkdownClick"
        />

        <div v-if="errorMessage" class="chat-demo-error" role="alert">
          <span>{{ errorMessage }}</span>
          <button type="button" class="chat-demo-close" @click="clearError">
            关闭
          </button>
        </div>

        <ChatComposer
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
import { computed } from 'vue';
import { useChatDemo } from '../use-chat-demo';
import ChatComposer from './chat-composer.vue';
import ChatHistorySidebar from './chat-history-sidebar.vue';
import ChatMessageList from './chat-message-list.vue';
import type { ChatDemoAdapter, ChatDemoOptions } from '../types';

const props = withDefaults(
  defineProps<{
    adapter: ChatDemoAdapter;
    options?: ChatDemoOptions;
  }>(),
  {
    options: () => ({}),
  },
);

const {
  input,
  sessions,
  selectedSessionId,
  historyLoading,
  messageLoading,
  stopping,
  messages,
  busy,
  canSend,
  errorMessage,
  currentStateText,
  autoScrollKey,
  loadSessions,
  selectSession,
  send,
  stopChat,
  clearChat,
  startNewSession,
  clearError,
} = useChatDemo(props.adapter);

const displayOptions = computed(() => ({
  assistantName: props.options.assistantName ?? '助手',
  userLabel: props.options.userLabel ?? '你',
  historyTitle: props.options.historyTitle ?? '历史会话',
  emptyTitle: props.options.emptyTitle ?? '输入问题开始演示',
  emptyDescription:
    props.options.emptyDescription ?? '助手会检索知识库并以流式方式返回答案。',
}));
</script>

<style lang="less" scoped>
.chat-demo-page {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 16px;
}

.chat-demo-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chat-demo-action {
  min-width: 72px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 6px;
  background: var(--agent-chat-card-bg-color, #fff);
  color: var(--agent-chat-text-primary-color, #1f2329);
  font-size: 14px;
  cursor: pointer;
}

.chat-demo-action.is-primary {
  border-color: transparent;
  background: var(--agent-chat-primary-color, #1677ff);
  color: #fff;
}

.chat-demo-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-demo-workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  flex: 1 1 auto;
  min-height: 0;
  gap: 16px;
}

.chat-demo-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 8px;
  background: var(--agent-chat-card-bg-color, #fff);
}

.chat-demo-error {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-top: 1px solid var(--agent-chat-red-border, rgb(255 77 79 / 30%));
  background: var(--agent-chat-red-disabled-color, #fff2f0);
  color: var(--agent-chat-red-color, #ff4d4f);
  gap: 12px;
}

.chat-demo-close {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--agent-chat-red-color, #ff4d4f);
  font-size: 13px;
  cursor: pointer;
}

@media (width <= 900px) {
  .chat-demo-workspace {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .chat-demo-history {
    min-height: 260px;
  }

  .chat-demo-shell {
    min-height: 420px;
  }
}
</style>
