<template>
  <ChatDemoShell :adapter="adapter" :options="options" />
</template>

<script setup lang="ts">
import { ChatDemoShell } from '@aplus-sql/ui-kit/chat-demo';
import type {
  ChatDemoAdapter,
  ChatDemoOptions,
} from '@aplus-sql/ui-kit/chat-demo';

defineProps<{
  adapter: ChatDemoAdapter;
  options?: ChatDemoOptions;
}>();
</script>
