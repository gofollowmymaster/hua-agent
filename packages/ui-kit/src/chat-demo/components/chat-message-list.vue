<template>
  <div
    ref="messagePaneRef"
    class="chat-demo-messages"
    role="log"
    aria-live="polite"
  >
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
          <template v-else-if="part.type === 'data-status'">
            <ChatStatusCard :text="formatStatus(part.data)" />
            <template v-if="part.data?.stage === 'tool_result'">
              <div
                v-if="hasToolArguments(part.data)"
                class="chat-demo-tool-output"
              >
                <div class="chat-demo-tool-output-label">工具入参</div>
                <pre>{{ formatJson(part.data?.arguments) }}</pre>
              </div>
              <div
                v-if="part.data?.result !== undefined"
                class="chat-demo-tool-output"
              >
                <div class="chat-demo-tool-output-label">工具输出</div>
                <pre>{{ formatToolOutput(part.data?.result) }}</pre>
              </div>
            </template>
          </template>
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
import type { ChatDemoMessage, ChatDemoStatusData } from '../types';

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

function hasToolArguments(data?: ChatDemoStatusData) {
  return data?.arguments !== undefined && Object.keys(data.arguments).length > 0;
}

function formatJson(value: unknown) {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatToolOutput(result?: string) {
  if (result === undefined) return '';
  try {
    return JSON.stringify(JSON.parse(result), null, 2);
  } catch {
    return result;
  }
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

.chat-demo-tool-output {
  margin: 0 0 10px;
}

.chat-demo-tool-output-label {
  margin: 6px 0 4px;
  color: var(--agent-chat-text-tertiary-color, #a6a6a6);
  font-size: 12px;
}

.chat-demo-tool-output pre {
  max-height: 320px;
  margin: 0;
  padding: 8px;
  overflow: auto;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 6px;
  background: var(--agent-chat-fill-hover-color, #fafafa);
  color: var(--agent-chat-text-primary-color, #1f2329);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (width <= 900px) {
  .chat-demo-message {
    grid-template-columns: 52px minmax(0, 1fr);
  }
}
</style>
