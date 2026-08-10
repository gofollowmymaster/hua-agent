<template>
  <ChatDemoShell :adapter="adapter" :options="options" />
</template>

<script setup lang="ts">
import { ChatDemoShell } from '@aplus-sql/ui-kit/chat-demo';
import { createRagChatAdapter } from './rag-chat.adapter';

const adapter = createRagChatAdapter();
const options = {
  assistantName: '助手',
  userLabel: '你',
  historyTitle: '历史会话',
  emptyTitle: '输入问题开始演示',
  emptyDescription: '助手会检索已索引文档，并以流式方式返回答案。',
};
</script>
