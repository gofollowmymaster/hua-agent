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
        <ChatProcessBlock
          v-if="
            collapseProcessAfterAnswer && getProcessParts(message).length > 0
          "
          :key="`${message.id}-process`"
          :parts="getProcessParts(message)"
          :open="!hasFinalText(message)"
          :format-status="formatStatus"
        />
        <template
          v-for="(part, index) in getVisibleParts(message)"
          :key="`${message.id}-${index}`"
        >
          <ChatReasoningBlock
            v-if="!collapseProcessAfterAnswer && part.type === 'reasoning'"
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
            v-else-if="
              !collapseProcessAfterAnswer && part.type === 'data-status'
            "
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
import ChatProcessBlock from './chat-process-block.vue';
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
  collapseProcessAfterAnswer?: boolean;
  onMarkdownClick?: (event: MouseEvent) => void;
}>();

const messagePaneRef = ref<HTMLElement>();

function getProcessParts(message: ChatDemoMessage) {
  return message.parts.filter(
    (part) => part.type === 'reasoning' || part.type === 'data-status',
  );
}

function getVisibleParts(message: ChatDemoMessage) {
  if (!props.collapseProcessAfterAnswer) return message.parts;
  return message.parts.filter(
    (part) => part.type !== 'reasoning' && part.type !== 'data-status',
  );
}

function hasFinalText(message: ChatDemoMessage) {
  return message.parts.some(
    (part) =>
      part.type === 'text' &&
      (part.state === 'streaming' || part.state === 'done'),
  );
}

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
  color: var(--agent-chat-text-primary-color, #1f2329);
  font-size: 20px;
  line-height: 28px;
}

.chat-demo-empty p {
  margin: 8px 0 0;
  color: var(--agent-chat-text-secondary-color, #646a73);
}

.chat-demo-message {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.chat-demo-message-role {
  color: var(--agent-chat-text-secondary-color, #646a73);
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
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 8px;
  background: var(--agent-chat-fill-bg-color, #f5f5f5);
  color: var(--agent-chat-text-primary-color, #1f2329);
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.chat-demo-markdown {
  --md-bk-color: transparent;

  background-color: transparent;
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
  color: var(--agent-chat-blue-hover-color, #4096ff);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.chat-demo-markdown :deep(.md-editor-preview a:hover) {
  color: var(--agent-chat-primary-active-color, #0958d9);
}

.chat-demo-message--user .chat-demo-text {
  border-color: var(--agent-chat-green-color, #52c41a);
  background: var(--agent-chat-green-disabled-color, #f6ffed);
}

@media (width <= 900px) {
  .chat-demo-message {
    grid-template-columns: 52px minmax(0, 1fr);
  }
}
</style>
