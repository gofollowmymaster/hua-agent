<template>
  <form class="agent-composer" @submit.prevent="handleSubmit">
    <textarea
      :value="modelValue"
      class="agent-input"
      :disabled="busy || messageLoading"
      placeholder="输入问题，Enter 发送，Shift+Enter 换行"
      rows="3"
      @input="handleInput"
      @keydown="handleInputKeydown"
    />
    <div class="agent-composer-footer">
      <span class="agent-state">{{ stateText }}</span>
      <ApButton
        type="primary"
        html-type="submit"
        :danger="busy"
        :disabled="buttonDisabled"
      >
        {{ buttonText }}
      </ApButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ApButton } from '@aplus-frontend/ui';

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
.agent-composer {
  flex: 0 0 auto;
  padding: 14px;
  border-top: 1px solid @border-color;
  background: @card-bg-color;
}

.agent-input {
  width: 100%;
  min-height: 86px;
  max-height: 180px;
  padding: 10px 12px;
  border: 1px solid @border-color;
  border-radius: 8px;
  outline: none;
  background: @card-bg-color;
  color: @text-primary-color;
  line-height: 1.6;
  resize: vertical;
}

.agent-input:focus {
  border-color: @green-color;
  box-shadow: 0 0 0 3px fade(@green-color, 16%);
}

.agent-input:disabled {
  background: @fill-hover-color;
  color: @text-tertiary-color;
}

.agent-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.agent-state {
  color: @text-secondary-color;
  font-size: 13px;
}
</style>
