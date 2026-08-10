<template>
  <form class="chat-demo-composer" @submit.prevent="handleSubmit">
    <textarea
      :value="modelValue"
      class="chat-demo-input"
      :disabled="busy || messageLoading"
      placeholder="输入问题，Enter 发送，Shift+Enter 换行"
      rows="3"
      @input="handleInput"
      @keydown="handleInputKeydown"
    />
    <div class="chat-demo-composer-footer">
      <span class="chat-demo-state">{{ stateText }}</span>
      <button
        type="submit"
        class="chat-demo-submit"
        :class="{ 'is-danger': busy }"
        :disabled="buttonDisabled"
      >
        {{ buttonText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  busy: boolean;
  canSend: boolean;
  messageLoading: boolean;
  stopping: boolean;
  stateText: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'send'): void;
  (event: 'stop'): void;
}>();

const buttonDisabled = computed(() => {
  if (props.busy) return props.stopping || props.messageLoading;
  return !props.canSend;
});
const buttonText = computed(() => {
  if (props.stopping) return '中断中';
  if (props.busy) return '停止回答';
  return '发送';
});

function handleSubmit() {
  if (props.busy) {
    emit('stop');
    return;
  }
  emit('send');
}

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  handleSubmit();
}
</script>

<style lang="less" scoped>
.chat-demo-composer {
  flex: 0 0 auto;
  padding: 14px;
  border-top: 1px solid var(--agent-chat-border-color, #d9d9d9);
  background: var(--agent-chat-card-bg-color, #fff);
}

.chat-demo-input {
  width: 100%;
  min-height: 86px;
  max-height: 180px;
  padding: 10px 12px;
  border: 1px solid var(--agent-chat-border-color, #d9d9d9);
  border-radius: 8px;
  outline: none;
  background: var(--agent-chat-card-bg-color, #fff);
  color: var(--agent-chat-text-primary-color, #1f2329);
  line-height: 1.6;
  resize: vertical;
}

.chat-demo-input:focus {
  border-color: var(--agent-chat-green-color, #52c41a);
  box-shadow: 0 0 0 3px var(--agent-chat-focus-shadow, rgb(82 196 26 / 16%));
}

.chat-demo-input:disabled {
  background: var(--agent-chat-fill-hover-color, #fafafa);
  color: var(--agent-chat-text-tertiary-color, #a6a6a6);
}

.chat-demo-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.chat-demo-state {
  color: var(--agent-chat-text-secondary-color, #646a73);
  font-size: 13px;
}

.chat-demo-submit {
  min-width: 72px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--agent-chat-primary-color, #1677ff);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.chat-demo-submit.is-danger {
  background: var(--agent-chat-red-color, #ff4d4f);
}

.chat-demo-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
