<template>
  <ChatDemoShell :adapter="adapter" :options="effectiveOptions" />
</template>

<script setup lang="ts">
import { ChatDemoShell } from '@aplus-sql/ui-kit/chat-demo';
import { computed } from 'vue';
import type {
  ChatDemoAdapter,
  ChatDemoOptions,
} from '@aplus-sql/ui-kit/chat-demo';

const props = defineProps<{
  adapter: ChatDemoAdapter;
  options?: ChatDemoOptions;
}>();

const effectiveOptions = computed(() => ({
  collapseProcessAfterAnswer: true,
  ...props.options,
}));
</script>
