<template>
  <div class="chat-demo-status-card">{{ text }}</div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<style lang="less" scoped>
.chat-demo-status-card {
  display: inline-flex;
  max-width: 100%;
  margin: 0 0 8px;
  padding: 5px 8px;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 6px;
  background: var(--agent-chat-fill-hover-color, #fafafa);
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}
</style>
