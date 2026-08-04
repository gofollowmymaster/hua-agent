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

<style scoped>
.assistant-reasoning {
  margin-bottom: 12px;
  border-left: 2px solid #8c8c8c;
  color: #595959;
}

.assistant-reasoning summary {
  width: fit-content;
  padding: 4px 10px;
  cursor: pointer;
  color: #434343;
  font-size: 13px;
  font-weight: 600;
}

.assistant-reasoning-content {
  padding: 6px 10px 8px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.65;
}
</style>
