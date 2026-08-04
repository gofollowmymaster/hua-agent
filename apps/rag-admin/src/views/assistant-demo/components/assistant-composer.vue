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
