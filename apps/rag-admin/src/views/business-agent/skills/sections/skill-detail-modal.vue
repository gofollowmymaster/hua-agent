<template>
  <Modal
    :open="open"
    title="Skill 详情"
    :footer="null"
    width="720px"
    destroy-on-close
    @cancel="emit('update:open', false)"
  >
    <ApDescriptions
      v-if="item"
      :schemas="schemas"
      :data-source="item"
      :column="1"
    />
    <pre v-if="item" class="instruction">{{ item.instruction }}</pre>
  </Modal>
</template>

<script setup lang="ts">
  import { Modal } from '@aplus-frontend/antdv';
  import { ApDescriptions } from '@aplus-frontend/ui';
  import type { DescriptionsItemSchema } from '@aplus-frontend/ui';
  import type {
    SystemSkillItem,
    UserSkillItem
  } from '@/api/business-agent/skills';

  defineProps<{
    open: boolean;
    item?: SystemSkillItem | UserSkillItem;
  }>();
  const emit = defineEmits<{ 'update:open': [value: boolean] }>();
  const schemas: DescriptionsItemSchema[] = [
    { label: '名称', field: 'name', valueType: 'text' },
    { label: '类型', field: 'type', valueType: 'text' },
    { label: '描述', field: 'description', valueType: 'text' }
  ];
</script>

<style lang="less" scoped>
  .instruction {
    max-height: 360px;
    margin: 16px 0 0;
    padding: 12px;
    overflow: auto;
    border: 1px solid @border-color;
    border-radius: 6px;
    background: @fill-bg-color;
    color: @text-primary-color;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 20px;
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
