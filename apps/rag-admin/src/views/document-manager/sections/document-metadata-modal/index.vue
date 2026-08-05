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
import type { RagDocumentItem } from '@/api/rag-admin';

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

<style scoped>
.metadata-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #344054;
  font-size: 13px;
  font-weight: 600;
}

.metadata-input {
  height: 36px;
  padding: 6px 11px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  color: #101828;
  font-size: 14px;
  line-height: 22px;
  outline: none;
}

.metadata-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgb(22 119 255 / 12%);
}
</style>
