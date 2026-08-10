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
  border: 1px solid @border-color;
  border-radius: 6px;
  background: @fill-hover-color;
  color: @text-secondary-color;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}
</style>
