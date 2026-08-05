<template>
  <form class="assistant-composer" @submit.prevent="handleSubmit">
    <textarea
      :value="modelValue"
      class="assistant-input"
      :disabled="busy || messageLoading"
      placeholder="输入问题，Enter 发送，Shift+Enter 换行"
      rows="3"
      @input="handleInput"
      @keydown="handleInputKeydown"
    />
    <div class="assistant-composer-footer">
      <span class="assistant-state">{{ stateText }}</span>
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

<style scoped>
.assistant-composer {
  flex: 0 0 auto;
  padding: 14px;
  border-top: 1px solid #e1e7ef;
  background: #ffffff;
}

.assistant-input {
  width: 100%;
  min-height: 86px;
  max-height: 180px;
  resize: vertical;
  padding: 10px 12px;
  border: 1px solid #cfd8e3;
  border-radius: 8px;
  color: #202633;
  background: #ffffff;
  line-height: 1.6;
  outline: none;
}

.assistant-input:focus {
  border-color: #48a77c;
  box-shadow: 0 0 0 3px rgba(72, 167, 124, 0.16);
}

.assistant-input:disabled {
  color: #8995a5;
  background: #f4f6f8;
}

.assistant-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.assistant-state {
  color: #667386;
  font-size: 13px;
}
</style>
