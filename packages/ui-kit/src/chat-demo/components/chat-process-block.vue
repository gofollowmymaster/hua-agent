<template>
  <details class="chat-demo-process" :open="open">
    <summary>过程信息</summary>
    <div class="chat-demo-process-content">
      <template v-for="(part, index) in parts" :key="index">
        <div
          v-if="part.type === 'reasoning'"
          class="chat-demo-process-reasoning"
        >
          <div class="chat-demo-process-reasoning-label">思考过程</div>
          <div class="chat-demo-process-reasoning-text">{{ part.text }}</div>
        </div>
        <ChatStatusCard
          v-else-if="part.type === 'data-status'"
          :text="formatStatus(part.data)"
        />
      </template>
    </div>
  </details>
</template>

<script setup lang="ts">
import ChatStatusCard from './chat-status-card.vue';
import type { ChatDemoMessage } from '../types';

defineProps<{
  parts: ChatDemoMessage['parts'];
  formatStatus: (data: unknown) => string;
  open?: boolean;
}>();
</script>

<style lang="less" scoped>
.chat-demo-process {
  margin-bottom: 12px;
  border-left: 2px solid var(--agent-chat-text-tertiary-color, #a6a6a6);
  color: var(--agent-chat-text-secondary-color, #646a73);
}

.chat-demo-process summary {
  width: fit-content;
  padding: 4px 10px;
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.chat-demo-process-content {
  padding: 6px 10px 8px;
}

.chat-demo-process-reasoning {
  margin-bottom: 8px;
}

.chat-demo-process-reasoning-label {
  margin-bottom: 4px;
  color: var(--agent-chat-text-tertiary-color, #a6a6a6);
  font-size: 12px;
}

.chat-demo-process-reasoning-text {
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
