<template>
  <div class="table-fill">
    <AgGrid :columns="columns" v-bind="gridProps">
      <template #title="{ selectedRowKeys, clearAll }">
        <TableTopActionBar
          :selected-row-keys="selectedRowKeys"
          :clear-all="clearAll"
          :show-selected="false"
          :settings="{ persistenceKey: 'rag_admin_agent_system_skills' }"
          :refresh-config="{ refresh: reload }"
        />
      </template>
    </AgGrid>
    <SkillDetailModal v-model:open="detailOpen" :item="selectedSkill" />
  </div>
</template>

<script setup lang="ts">
  import { h, ref } from 'vue';
  import { AgGrid, ApTag, usePageListAgGrid } from '@aplus-frontend/ui';
  import type { AgGridColumnType } from '@aplus-frontend/ui';
  import { TableTopActionBar } from '@aplus-sql/ui-kit';
  import {
    pageSystemSkillsGrid,
    type SystemSkillItem
  } from '@/api/business-agent/skills';
  import { ThemeColor } from '@/config/theme-color-token';
  import SkillDetailModal from './skill-detail-modal.vue';

  const detailOpen = ref(false);
  const selectedSkill = ref<SystemSkillItem>();
  const columns: AgGridColumnType<SystemSkillItem>[] = [
    {
      title: '关键词',
      key: 'keyword',
      dataIndex: 'keyword',
      valueType: 'text',
      hideInTable: true,
      fieldProps: {
        placeholder: '名称 / 描述 / 指令',
        field: { allowClear: true }
      }
    },
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
      width: 180,
      hideInSearch: true
    },
    {
      title: '描述',
      key: 'description',
      dataIndex: 'description',
      minWidth: 300,
      flex: 1,
      ellipsis: true,
      hideInSearch: true
    },
    {
      title: '状态',
      key: 'isEnabled',
      dataIndex: 'isEnabled',
      width: 100,
      hideInSearch: true,
      customRender: () =>
        h(ApTag, { text: '强制启用', color: ThemeColor.Green })
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 100,
      fixed: 'right',
      valueType: 'action',
      hideInSearch: true,
      fieldProps({ record }) {
        if (!record) return {};
        return {
          actions: [
            {
              text: '查看',
              onClick: () => {
                selectedSkill.value = record;
                detailOpen.value = true;
              }
            }
          ]
        };
      }
    }
  ];

  const [gridProps, { reload }] = usePageListAgGrid({
    api: pageSystemSkillsGrid,
    rowKey: 'key',
    isShowRowSelection: false,
    adaptive: true,
    searchForm: { colon: false },
    wrapperStyle: { height: '100%' },
    pagination: false
  });
</script>

<style lang="less" scoped>
  .table-fill {
    height: 100%;
    min-height: 420px;
  }
</style>
