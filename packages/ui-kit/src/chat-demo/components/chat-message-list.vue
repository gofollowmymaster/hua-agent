<template>
  <div ref="messagePaneRef" class="chat-demo-messages" role="log" aria-live="polite">
    <div v-if="messages.length === 0" class="chat-demo-empty">
      <h2>{{ emptyTitle }}</h2>
      <p>{{ emptyDescription }}</p>
    </div>

    <article
      v-for="message in messages"
      :key="message.id"
      class="chat-demo-message"
      :class="`chat-demo-message--${message.role}`"
    >
      <div class="chat-demo-message-role">
        {{ message.role === 'user' ? userLabel : assistantName }}
      </div>
      <div class="chat-demo-message-body">
        <template
          v-for="(part, index) in message.parts"
          :key="`${message.id}-${index}`"
        >
          <ChatReasoningBlock
            v-if="part.type === 'reasoning'"
            :state="part.state"
            :text="part.text"
          />
          <div v-if="part.type === 'text'" class="chat-demo-text">
            <MdPreview
              :id="`chat-markdown-${message.id}-${index}`"
              class="chat-demo-markdown"
              :model-value="part.text"
              theme="light"
              preview-theme="github"
              no-katex
              @click.capture="handleMarkdownClick"
            />
          </div>
          <ChatStatusCard
            v-else-if="part.type === 'data-status'"
            :text="formatStatus(part.data)"
          />
        </template>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import ChatReasoningBlock from './chat-reasoning-block.vue';
import ChatStatusCard from './chat-status-card.vue';
import type { ChatDemoMessage } from '../types';

const props = defineProps<{
  messages: ChatDemoMessage[];
  formatStatus: (data: unknown) => string;
  assistantName?: string;
  userLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  autoScrollKey?: string;
  onMarkdownClick?: (event: MouseEvent) => void;
}>();

const messagePaneRef = ref<HTMLElement>();

function handleMarkdownClick(event: MouseEvent) {
  props.onMarkdownClick?.(event);
}

watch(
  () => props.autoScrollKey,
  async () => {
    await nextTick();
    if (messagePaneRef.value) {
      messagePaneRef.value.scrollTop = messagePaneRef.value.scrollHeight;
    }
  },
  { deep: true },
);
</script>

<style lang="less" scoped>
.chat-demo-messages {
  flex: 1 1 auto;
  min-height: 0;
  padding: 20px;
  overflow: auto;
}

.chat-demo-empty {
  display: grid;
  min-height: 280px;
  place-content: center;
  text-align: center;
}

.chat-demo-empty h2 {
  margin: 0;
  color: @text-primary-color;
  font-size: 20px;
  line-height: 28px;
}

.chat-demo-empty p {
  margin: 8px 0 0;
  color: @text-secondary-color;
}

.chat-demo-message {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.chat-demo-message-role {
  color: @text-secondary-color;
  font-weight: 700;
  line-height: 32px;
}

.chat-demo-message-body {
  max-width: 840px;
}

.chat-demo-message--user .chat-demo-message-body {
  justify-self: end;
}

.chat-demo-message--assistant .chat-demo-message-body {
  justify-self: start;
}

.chat-demo-text {
  margin: 0 0 8px;
  padding: 10px 12px;
  border: 1px solid @border-color;
  border-radius: 8px;
  background: @fill-bg-color;
  color: @text-primary-color;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.chat-demo-markdown :deep(.md-editor-preview-wrapper) {
  padding: 0;
  background: transparent;
}

.chat-demo-markdown :deep(.md-editor-preview) {
  color: inherit;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.chat-demo-markdown :deep(.md-editor-preview > :first-child) {
  margin-top: 0;
}

.chat-demo-markdown :deep(.md-editor-preview > :last-child) {
  margin-bottom: 0;
}

.chat-demo-markdown :deep(.md-editor-preview p),
.chat-demo-markdown :deep(.md-editor-preview ul),
.chat-demo-markdown :deep(.md-editor-preview ol),
.chat-demo-markdown :deep(.md-editor-preview blockquote),
.chat-demo-markdown :deep(.md-editor-preview pre),
.chat-demo-markdown :deep(.md-editor-preview table) {
  margin-bottom: 10px;
}

.chat-demo-markdown :deep(.md-editor-preview pre),
.chat-demo-markdown :deep(.md-editor-preview table) {
  max-width: 100%;
  overflow-x: auto;
}

.chat-demo-markdown :deep(.md-editor-preview a) {
  color: @blue-hover-color;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.chat-demo-markdown :deep(.md-editor-preview a:hover) {
  color: @primary-active-color;
}

.chat-demo-message--user .chat-demo-text {
  border-color: @green-color;
  background: @green-disabled-color;
}

@media (width <= 900px) {
  .chat-demo-message {
    grid-template-columns: 52px minmax(0, 1fr);
  }
}
</style>
