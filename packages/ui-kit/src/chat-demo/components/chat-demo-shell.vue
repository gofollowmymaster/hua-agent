<template>
  <section class="page chat-demo-page">
    <div class="chat-demo-actions">
      <ApButton type="primary" @click="startNewSession">新建会话</ApButton>
      <ApButton v-if="busy" @click="stopChat">停止</ApButton>
      <ApButton :disabled="busy && messages.length === 0" @click="clearChat">
        清空
      </ApButton>
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
          <ApButton type="link" @click="clearError">关闭</ApButton>
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
import { ApButton } from '@aplus-frontend/ui';
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
  gap: 16px;
}

.chat-demo-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @card-bg-color;
}

.chat-demo-error {
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
