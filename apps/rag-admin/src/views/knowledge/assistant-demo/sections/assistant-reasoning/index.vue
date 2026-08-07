<template>
  <details class="assistant-reasoning" :open="state === 'streaming'">
    <summary>思考摘要</summary>
    <div class="assistant-reasoning-content">{{ text }}</div>
  </details>
</template>

<script setup lang="ts">
import type { ReasoningUIPart } from 'ai';

defineProps<{
  text: string;
  state?: ReasoningUIPart['state'];
}>();
</script>

<style lang="less" scoped>
.assistant-reasoning {
  margin-bottom: 12px;
  border-left: 2px solid @text-tertiary-color;
  color: @text-secondary-color;
}

.assistant-reasoning summary {
  width: fit-content;
  padding: 4px 10px;
  color: @text-secondary-color;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.assistant-reasoning-content {
  padding: 6px 10px 8px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
