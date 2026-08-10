<template>
  <div class="metadata-form">
    <label class="metadata-field">
      <span>type</span>
      <input
        v-model="form.type"
        class="metadata-input"
        placeholder="业务分类"
      />
    </label>
    <label class="metadata-field">
      <span>tag</span>
      <input
        v-model="form.tag"
        class="metadata-input"
        placeholder="标签"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { RagDocumentItem } from '@/api/knowledge-qa/documents';

const props = defineProps<{
  item: RagDocumentItem;
}>();

const form = ref({
  type: '',
  tag: '',
});

watch(
  () => props.item.id,
  () => {
    form.value = {
      type: props.item.type || '',
      tag: props.item.tag || '',
    };
  },
  {
    immediate: true,
  },
);

function getForm() {
  return {
    type: form.value.type,
    tag: form.value.tag,
  };
}

defineExpose({ getForm });
</script>

<style lang="less" scoped>
.metadata-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: @text-secondary-color;
  font-size: 13px;
  font-weight: 600;
}

.metadata-input {
  height: 36px;
  padding: 6px 11px;
  border: 1px solid @border-color;
  border-radius: 6px;
  outline: none;
  color: @text-primary-color;
  font-size: 14px;
  line-height: 22px;
}

.metadata-input:focus {
  border-color: @blue-color;
  box-shadow: 0 0 0 2px fade(@blue-color, 12%);
}
</style>
