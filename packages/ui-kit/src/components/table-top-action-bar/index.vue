<template>
  <div class="table-top-action-bar">
    <ApBatchAction
      v-if="hasSuffixContent"
      :selected-row-keys="selectedRowKeys"
      :clear-all="clearAll"
      :show-selected="showSelected"
    >
      <template #prefix>
        <div v-if="hasHeaderContent" class="table-top-action-bar-header">
          <slot name="header" />
        </div>
        <div class="table-top-action-bar-suffix">
          <slot name="suffix" />
        </div>
      </template>
      <template #suffix>
        <SettingGroup :settings="settings" :refresh-config="refreshConfig">
          <slot name="setting" />
        </SettingGroup>
      </template>
    </ApBatchAction>

    <div v-else class="table-top-action-bar-row">
      <div v-if="hasHeaderContent" class="table-top-action-bar-header">
        <slot name="header" />
      </div>
      <SettingGroup :settings="settings" :refresh-config="refreshConfig">
        <slot name="setting" />
      </SettingGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';
  import type { VNode } from 'vue';
  import { ApBatchAction } from '@aplus-frontend/ui';
  import type { TableTopActionBarProps } from './interface';
  import SettingGroup from './setting-group.vue';

  withDefaults(defineProps<TableTopActionBarProps>(), {
    showSelected: true
  });

  const slots = useSlots();

  const hasSlotContent = (slot?: () => VNode[]) => {
    if (!slot) {
      return false;
    }
    return slot().some((node) => node.type !== Symbol.for('v-cmt'));
  };

  const hasHeaderContent = computed(() => hasSlotContent(slots.header));
  const hasSuffixContent = computed(() => hasSlotContent(slots.suffix));
</script>

<style lang="less" scoped>
  .table-top-action-bar {
    margin-bottom: 8px;
  }

  .table-top-action-bar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .table-top-action-bar-header,
  .table-top-action-bar-suffix {
    display: flex;
    align-items: center;
  }
</style>
