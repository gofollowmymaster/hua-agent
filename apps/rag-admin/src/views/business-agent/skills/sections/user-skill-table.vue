<template>
  <div class="table-fill">
    <AgGrid :columns="columns" v-bind="gridProps">
      <template #title="{ selectedRowKeys, clearAll }">
        <TableTopActionBar
          :selected-row-keys="selectedRowKeys"
          :clear-all="clearAll"
          :show-selected="false"
          :settings="{ persistenceKey: 'rag_admin_agent_user_skills' }"
          :refresh-config="{ refresh: reload }"
        >
          <template #suffix>
            <ApButton type="primary" @click="openCreate">新建 Skill</ApButton>
          </template>
        </TableTopActionBar>
      </template>
    </AgGrid>
    <SkillFormModal
      v-model:open="formOpen"
      :item="editingSkill"
      @saved="reload"
    />
    <SkillDetailModal v-model:open="detailOpen" :item="selectedSkill" />
  </div>
</template>

<script setup lang="ts">
  import { h, ref } from 'vue';
  import dayjs from 'dayjs';
  import { Switch, message } from '@aplus-frontend/antdv';
  import {
    AgGrid,
    ApButton,
    ApModal,
    ApTag,
    usePageListAgGrid
  } from '@aplus-frontend/ui';
  import type { AgGridColumnType } from '@aplus-frontend/ui';
  import { TableTopActionBar } from '@aplus-sql/ui-kit';
  import {
    deleteUserSkill,
    pageUserSkillsGrid,
    updateUserSkill,
    type UserSkillItem
  } from '@/api/business-agent/skills';
  import { ThemeColor } from '@/config/theme-color-token';
  import SkillDetailModal from './skill-detail-modal.vue';
  import SkillFormModal from './skill-form-modal.vue';

  const formOpen = ref(false);
  const detailOpen = ref(false);
  const editingSkill = ref<UserSkillItem>();
  const selectedSkill = ref<UserSkillItem>();
  const columns: AgGridColumnType<UserSkillItem>[] = [
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
      title: '状态',
      key: 'isEnabled',
      dataIndex: 'isEnabled',
      valueType: 'select',
      width: 110,
      valueEnum: {
        true: { text: '已启用' },
        false: { text: '已停用' }
      },
      customRender: ({ record }) =>
        h(ApTag, {
          text: record.isEnabled ? '已启用' : '已停用',
          color: record.isEnabled ? ThemeColor.Green : ThemeColor.Gray
        })
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
      minWidth: 260,
      flex: 1,
      ellipsis: true,
      hideInSearch: true
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      width: 170,
      hideInSearch: true,
      customRender: ({ record }) =>
        dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '启用',
      key: 'enabledAction',
      dataIndex: 'enabledAction',
      width: 90,
      hideInSearch: true,
      customRender: ({ record }) =>
        h(Switch, {
          checked: record.isEnabled,
          'onUpdate:checked': (value: boolean | string | number) => {
            void toggle(record, Boolean(value));
          }
        })
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 190,
      fixed: 'right',
      valueType: 'action',
      hideInSearch: true,
      fieldProps({ record }) {
        if (!record) return {};
        return {
          actions: [
            { text: '查看', onClick: () => view(record) },
            { text: '编辑', onClick: () => edit(record) },
            { text: '删除', color: 'error', onClick: () => remove(record) }
          ]
        };
      }
    }
  ];

  const [gridProps, { reload }] = usePageListAgGrid({
    api: pageUserSkillsGrid,
    rowKey: 'id',
    isShowRowSelection: false,
    adaptive: true,
    searchForm: { colon: false },
    wrapperStyle: { height: '100%' },
    scroll: { x: 1080 }
  });

  function openCreate() {
    editingSkill.value = undefined;
    formOpen.value = true;
  }

  function edit(item: UserSkillItem) {
    editingSkill.value = item;
    formOpen.value = true;
  }

  function view(item: UserSkillItem) {
    selectedSkill.value = item;
    detailOpen.value = true;
  }

  async function toggle(item: UserSkillItem, isEnabled: boolean) {
    await updateUserSkill(item.id, { isEnabled });
    message.success(isEnabled ? '用户 Skill 已启用' : '用户 Skill 已停用');
    reload();
  }

  function remove(item: UserSkillItem) {
    ApModal.confirm({
      title: '确认删除用户 Skill？',
      content: `删除“${item.name}”后无法恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        await deleteUserSkill(item.id);
        message.success('用户 Skill 已删除');
        reload();
      }
    });
  }
</script>

<style lang="less" scoped>
  .table-fill {
    height: 100%;
    min-height: 420px;
  }
</style>
