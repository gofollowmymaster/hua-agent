<template>
  <div class="table-top-action-bar-actions">
    <slot />
    <ApTable.Setting
      v-if="settings && settings.hidden !== true"
      :config="tableSettingConfig"
    />
    <button
      v-if="refreshConfig?.visible !== false"
      class="table-top-action-bar-icon-button"
      type="button"
      :title="refreshConfig?.tooltip || '刷新'"
      @click="handleRefresh"
    >
      <RefreshIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, defineComponent, h } from 'vue';
  import { useRoute } from 'vue-router';
  import { ApTable } from '@aplus-frontend/ui';
  import type { ApTableSettingType } from '@aplus-frontend/ui';
  import { useInjectApTable } from '@aplus-frontend/ui/es/src/ap-table/context';
  import type { TableTopSettingGroupProps } from './interface';

  const props = defineProps<TableTopSettingGroupProps>();

  const route = useRoute();
  const { refresh } = useInjectApTable();

  const RefreshIcon = defineComponent({
    render() {
      return h(
        'svg',
        {
          width: 14,
          height: 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        },
        [
          h('path', { d: 'M13.65 10.35A6 6 0 1 1 14 8' }),
          h('path', { d: 'M14 4v4h-4' })
        ]
      );
    }
  });

  const getTableKey = computed(() => {
    const key = `${String(route.name ?? '')}_${
      props.settings?.persistenceKey ?? ''
    }`;
    return `rag_admin_table_${key}`;
  });

  const tableSettingConfig = computed<ApTableSettingType>(() => ({
    ...(props.settings as ApTableSettingType),
    persistenceKey: getTableKey.value
  }));

  function handleRefresh() {
    if (props.refreshConfig?.refresh) {
      props.refreshConfig.refresh();
    } else {
      refresh?.();
    }
  }
</script>

<style lang="less" scoped>
  .table-top-action-bar-actions {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .table-top-action-bar-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid @border-color;
    border-radius: 4px;
    background: transparent;
    color: @text-primary-color;
    cursor: pointer;

    &:hover {
      background: @fill-hover-color;
    }
  }
</style>
