<template>
  <div class="chat-demo-reasoning">
    <div class="chat-demo-reasoning-label">思考过程</div>
    <div class="chat-demo-reasoning-content">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import type { ReasoningUIPart } from 'ai';

defineProps<{
  text: string;
  state?: ReasoningUIPart['state'];
}>();
</script>

<style lang="less" scoped>
.chat-demo-reasoning {
  margin-bottom: 12px;
  border-left: 2px solid var(--agent-chat-text-tertiary-color, #a6a6a6);
  color: var(--agent-chat-text-secondary-color, #646a73);
}

.chat-demo-reasoning-label {
  width: fit-content;
  padding: 4px 10px;
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 13px;
  font-weight: 600;
}

.chat-demo-reasoning-content {
  padding: 6px 10px 8px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
