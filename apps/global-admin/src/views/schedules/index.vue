<template>
  <section class="page">
    <Alert
      v-if="errorMessage"
      class="page-alert"
      type="error"
      show-icon
      :message="errorTitle"
      :description="errorMessage"
    >
      <template #action>
        <ApButton size="small" @click="load">重试</ApButton>
      </template>
    </Alert>

    <template v-else>
      <div class="filter-bar">
        <Input
          v-model:value="keyword"
          class="filter-keyword"
          placeholder="模块 / 功能描述"
          allow-clear
        />
        <Select
          v-model:value="status"
          class="filter-status"
          placeholder="状态"
          allow-clear
          :options="statusOptions"
        />
      </div>

      <div class="grid-fill">
        <AgGrid
          :columns="columns"
          :data-source="filteredSchedules"
          :loading="loading"
          :search-form="false"
          :pagination="false"
          :wrapper-style="{ height: '100%' }"
          :row-class-name="getPointerRowClassName()"
          row-key="taskKey"
          browser-tooltips
          column-resizable
          @row-clicked="handleRowClicked"
        >
          <template #title="{ selectedRowKeys, clearAll }">
            <TableTopActionBar
              :selected-row-keys="selectedRowKeys"
              :clear-all="clearAll"
              :show-selected="false"
              :settings="{
                persistenceKey: 'global_admin_table_schedules_task-list'
              }"
              :refresh-config="{ refresh: load }"
            />
          </template>
        </AgGrid>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed, h, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Alert, Input, Select, message } from '@aplus-frontend/antdv';
  import {
    AgGrid,
    ApButton,
    ApModal,
    ApTag,
    type AgGridColumnType
  } from '@aplus-frontend/ui';
  import { TableTopActionBar, useRowClickAction } from '@aplus-sql/ui-kit';
  import {
    listSchedules,
    triggerSchedule,
    type ScheduledTaskRunResult,
    type ScheduledTaskStatus,
    type ScheduledTaskSummary
  } from '@/api/schedule';
  import { ThemeColor } from '@/config/theme-color-token';

  const route = useRoute();
  const loading = ref(false);
  const schedules = ref<ScheduledTaskSummary[]>([]);
  const keyword = ref('');
  const status = ref<ScheduledTaskStatus | undefined>();
  const errorMessage = ref('');
  const errorTitle = computed(() =>
    errorMessage.value.includes('无总控台访问权限')
      ? '无访问权限'
      : '定时任务加载失败'
  );
  const { onRowClick, getPointerRowClassName, clickAction } =
    useRowClickAction('schedules');

  const statusOptions = [
    { label: '启用', value: 'enabled' },
    { label: '停用', value: 'disabled' }
  ];

  const filteredSchedules = computed(() => {
    const text = keyword.value.trim().toLowerCase();
    return schedules.value.filter((item) => {
      const matchKeyword =
        !text ||
        item.module.toLowerCase().includes(text) ||
        item.description.toLowerCase().includes(text);
      const matchStatus = !status.value || item.status === status.value;
      return matchKeyword && matchStatus;
    });
  });

  const formatTime = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-';

  const statusTag = (item: ScheduledTaskSummary) =>
    h(ApTag, {
      text: item.status === 'enabled' ? '启用' : '停用',
      color:
        item.status === 'enabled' ? ThemeColor.Green : ThemeColor.TextTertiary
    });

  const resultTag = (result: ScheduledTaskRunResult | null) => {
    if (!result) return '-';
    return h(ApTag, {
      text: result === 'success' ? '成功' : '失败',
      color: result === 'success' ? ThemeColor.Green : ThemeColor.Red
    });
  };

  const columns: AgGridColumnType<ScheduledTaskSummary>[] = [
    {
      title: '模块',
      key: 'module',
      dataIndex: 'module',
      width: 130,
      valueType: 'text'
    },
    {
      title: '功能描述',
      key: 'description',
      dataIndex: 'description',
      minWidth: 240,
      flex: 1,
      valueType: 'text'
    },
    {
      title: '执行周期',
      key: 'cron',
      dataIndex: 'cron',
      width: 160,
      valueType: 'text'
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 90,
      valueType: 'text',
      customRender: ({ record }) => statusTag(record)
    },
    {
      title: '上次执行时间',
      key: 'lastRunTime',
      dataIndex: 'lastRunTime',
      width: 170,
      valueType: 'text',
      customRender: ({ record }) => formatTime(record.lastRunTime)
    },
    {
      title: '上次执行结果',
      key: 'lastRunResult',
      dataIndex: 'lastRunResult',
      width: 110,
      valueType: 'text',
      customRender: ({ record }) => resultTag(record.lastRunResult)
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 140,
      fixed: 'right',
      valueType: 'action',
      fieldProps({ record }) {
        if (!record) {
          return {};
        }
        return {
          actions: [
            clickAction({ text: '查看' }),
            {
              text: '触发',
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                confirmTrigger(record);
              }
            }
          ]
        };
      }
    }
  ];

  async function load() {
    loading.value = true;
    errorMessage.value = '';
    try {
      schedules.value = await listSchedules();
    } catch (error) {
      schedules.value = [];
      errorMessage.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  function handleRowClicked(
    record: ScheduledTaskSummary,
    event?: Event | null
  ) {
    onRowClick(event, {
      query: {
        ...Object.fromEntries(
          Object.entries(route.query).flatMap(([key, value]) =>
            typeof value === 'string' ? [[key, value]] : []
          )
        ),
        drawer: 'schedule-detail',
        drawerCode: record.taskKey
      },
      replace: Boolean(route.query.drawer)
    });
  }

  function confirmTrigger(record: ScheduledTaskSummary) {
    ApModal.confirm({
      title: '确认手动触发任务？',
      content: `将立即执行「${record.description}」（${record.taskKey}），执行结果会记录到执行日志。`,
      okText: '立即触发',
      cancelText: '取消',
      async onOk() {
        await triggerSchedule(record.taskKey);
        message.success('任务已触发执行');
        await load();
      }
    });
  }

  onMounted(load);
</script>

<style lang="less" scoped>
  .page-alert {
    margin: 4px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    padding: 12px 16px 0;
  }

  .filter-keyword {
    width: 260px;
  }

  .filter-status {
    width: 140px;
  }
</style>
