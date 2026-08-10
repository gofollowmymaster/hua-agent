<template>
  <ChatDemoShell :adapter="adapter" :options="options" />
</template>

<script setup lang="ts">
import { ChatDemoShell } from '@aplus-sql/ui-kit/chat-demo';
import { createAgentChatAdapter } from './agent-chat.adapter';

const adapter = createAgentChatAdapter();
const options = {
  assistantName: 'Agent',
  userLabel: '你',
  historyTitle: '历史会话',
  emptyTitle: '开始 Agent 演示',
  emptyDescription: 'Agent 会调用知识库和通用工具，以流式方式返回答案。',
};
</script>
