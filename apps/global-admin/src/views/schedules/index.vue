<template>
  <section class="page">
    <div class="grid-fill">
      <AgGrid
        ref="gridRef"
        :columns="columns"
        :request="fetchSchedules"
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
            :refresh-config="{ refresh: refreshGrid }"
          />
        </template>
      </AgGrid>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { h, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { message } from '@aplus-frontend/antdv';
  import {
    AgGrid,
    ApModal,
    ApTag,
    type AgGridColumnType,
    type AgGridExpose
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
  const gridRef = ref<AgGridExpose>();

  const { onRowClick, getPointerRowClassName, clickAction } =
    useRowClickAction('schedules');

  const statusValueEnum = {
    enabled: { text: '启用' },
    disabled: { text: '停用' }
  };

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
      title: '关键词',
      key: 'keyword',
      dataIndex: 'keyword',
      valueType: 'text',
      hideInTable: true,
      fieldProps: {
        placeholder: '模块 / 功能描述',
        field: {
          allowClear: true
        }
      }
    },
    {
      title: '模块',
      key: 'module',
      dataIndex: 'module',
      hideInSearch: true,
      width: 130,
      valueType: 'text'
    },
    {
      title: '功能描述',
      key: 'description',
      dataIndex: 'description',
      minWidth: 240,
      flex: 1,
      hideInSearch: true,
      valueType: 'text'
    },
    {
      title: '执行周期',
      key: 'cron',
      dataIndex: 'cron',
      width: 160,
      hideInSearch: true,
      valueType: 'text'
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: statusValueEnum,
      fieldProps: {
        placeholder: '全部状态',
        field: {
          allowClear: true
        }
      },
      customRender: ({ record }) => statusTag(record)
    },
    {
      title: '上次执行时间',
      key: 'lastRunTime',
      dataIndex: 'lastRunTime',
      width: 170,
      hideInSearch: true,
      valueType: 'text',
      customRender: ({ record }) => formatTime(record.lastRunTime)
    },
    {
      title: '上次执行结果',
      key: 'lastRunResult',
      dataIndex: 'lastRunResult',
      width: 110,
      hideInSearch: true,
      valueType: 'text',
      customRender: ({ record }) => resultTag(record.lastRunResult)
    },
    {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      width: 140,
      fixed: 'right',
      hideInSearch: true,
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

  async function fetchSchedules(params: {
    current?: number;
    pageSize?: number;
    keyword?: string;
    status?: ScheduledTaskStatus;
  }) {
    const data = await listSchedules({
      keyword: params.keyword,
      status: params.status
    });
    return { data, total: data.length };
  }

  function refreshGrid() {
    gridRef.value?.refresh();
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
        refreshGrid();
      }
    });
  }
</script>
