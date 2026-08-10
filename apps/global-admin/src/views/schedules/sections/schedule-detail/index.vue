<template>
  <section class="schedule-detail">
    <header class="detail-header">
      <div>
        <div class="detail-title">
          {{ detail?.description || '定时任务详情' }}
        </div>
        <div v-if="detail" class="detail-code">{{ detail.taskKey }}</div>
      </div>
      <div class="detail-actions">
        <ApButton
          type="primary"
          size="small"
          :loading="triggering"
          @click="confirmTrigger"
        >
          立即触发
        </ApButton>
        <ApButton type="text" @click="close">关闭</ApButton>
      </div>
    </header>

    <div class="detail-body">
      <Spin :spinning="loading">
        <Alert
          v-if="errorMessage"
          type="error"
          show-icon
          message="定时任务详情加载失败"
          :description="errorMessage"
        >
          <template #action>
            <ApButton size="small" @click="reloadAll">重试</ApButton>
          </template>
        </Alert>
        <template v-else>
          <ApDescriptions
            v-if="detail"
            :schemas="schemas"
            :data-source="detail"
            :column="1"
            bordered
          />

          <div class="logs-panel">
            <div class="logs-header">
              <span class="logs-title">执行日志</span>
              <Select
                v-model:value="logResult"
                class="logs-filter"
                placeholder="执行结果"
                allow-clear
                :options="logResultOptions"
              />
            </div>
            <div class="logs-table">
              <AgGrid
                ref="gridRef"
                :columns="logColumns"
                :request="fetchLogs"
                :params="{ result: logResult }"
                :pagination="{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: true
                }"
                row-key="id"
                size="mini"
                :wrapper-style="{ height: '100%' }"
                column-resizable
                browser-tooltips
              />
            </div>
          </div>
        </template>
      </Spin>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { h, onMounted, ref, watch } from 'vue';
  import { Alert, Select, Spin, message } from '@aplus-frontend/antdv';
  import {
    ApButton,
    ApDescriptions,
    ApModal,
    ApTag,
    AgGrid,
    type AgGridColumnType,
    type AgGridExpose,
    type DescriptionsItemSchema
  } from '@aplus-frontend/ui';
  import {
    getSchedule,
    listScheduleLogs,
    triggerSchedule,
    type ScheduledTaskDetail,
    type ScheduledTaskLogItem,
    type ScheduledTaskRunResult
  } from '@/api/schedule';
  import { ThemeColor } from '@/config/theme-color-token';
  import { useLayoutDrawer } from '@/layouts/layout-drawer/use-layout-drawer';

  const props = defineProps<{ drawerCode: string }>();
  const layoutDrawer = useLayoutDrawer();
  const loading = ref(false);
  const triggering = ref(false);
  const errorMessage = ref('');
  const detail = ref<ScheduledTaskDetail>();
  const logResult = ref<ScheduledTaskRunResult | undefined>();
  const gridRef = ref<AgGridExpose>();

  const logResultOptions = [
    { label: '成功', value: 'success' },
    { label: '失败', value: 'failed' }
  ];

  const formatTime = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-';

  const resultTag = (result: ScheduledTaskRunResult) =>
    h(ApTag, {
      text: result === 'success' ? '成功' : '失败',
      color: result === 'success' ? ThemeColor.Green : ThemeColor.Red
    });

  const schemas: DescriptionsItemSchema<ScheduledTaskDetail>[] = [
    {
      label: '模块',
      field: 'module',
      valueType: 'text',
      span: 3
    },
    {
      label: '功能描述',
      field: 'description',
      valueType: 'text',
      span: 3
    },
    {
      label: '执行周期',
      field: 'cron',
      valueType: 'text',
      span: 3
    },
    {
      label: '状态',
      field: 'status',
      valueType: 'text',
      span: 3,
      customRender: (record) =>
        record?.status === 'enabled'
          ? h(ApTag, { text: '启用', color: ThemeColor.Green })
          : h(ApTag, { text: '停用', color: ThemeColor.TextTertiary })
    },
    {
      label: '上次执行时间',
      field: 'lastRunTime',
      valueType: 'text',
      span: 3,
      customRender: (record) => formatTime(record?.lastRunTime)
    },
    {
      label: '上次执行结果',
      field: 'lastRunResult',
      valueType: 'text',
      span: 3,
      customRender: (record) =>
        record?.lastRunResult ? resultTag(record.lastRunResult) : '-'
    },
    {
      label: '创建时间',
      field: 'createdAt',
      valueType: 'text',
      span: 3,
      customRender: (record) => formatTime(record?.createdAt)
    },
    {
      label: '更新时间',
      field: 'updatedAt',
      valueType: 'text',
      span: 3,
      customRender: (record) => formatTime(record?.updatedAt)
    }
  ];

  const logColumns: AgGridColumnType<ScheduledTaskLogItem>[] = [
    {
      title: '执行时间',
      key: 'executeTime',
      dataIndex: 'executeTime',
      width: 180,
      customRender: ({ record }) => formatTime(record.executeTime)
    },
    {
      title: '执行结果',
      key: 'result',
      dataIndex: 'result',
      width: 90,
      customRender: ({ record }) => resultTag(record.result)
    },
    {
      title: '耗时(ms)',
      key: 'costMs',
      dataIndex: 'costMs',
      width: 90,
      customRender: ({ record }) => record.costMs ?? '-'
    },
    {
      title: '失败原因',
      key: 'message',
      dataIndex: 'message',
      ellipsis: true,
      customRender: ({ record }) => record.message || '-'
    }
  ];

  async function loadDetail() {
    loading.value = true;
    errorMessage.value = '';
    try {
      detail.value = await getSchedule(props.drawerCode);
    } catch (error) {
      detail.value = undefined;
      errorMessage.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchLogs(params: {
    current: number;
    pageSize: number;
    result?: ScheduledTaskRunResult;
  }) {
    try {
      const result = await listScheduleLogs(props.drawerCode, {
        result: params.result,
        page: params.current,
        pageSize: params.pageSize
      });
      return { data: result.list, total: result.total };
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error));
      return { data: [], total: 0 };
    }
  }

  function confirmTrigger() {
    ApModal.confirm({
      title: '确认手动触发任务？',
      content: `将立即执行「${detail.value?.description || props.drawerCode}」，执行结果会记录到执行日志。`,
      okText: '立即触发',
      cancelText: '取消',
      async onOk() {
        triggering.value = true;
        try {
          await triggerSchedule(props.drawerCode);
          message.success('任务已触发执行');
          await loadDetail();
          gridRef.value?.submitWith(true);
        } finally {
          triggering.value = false;
        }
      }
    });
  }

  function reloadAll() {
    loadDetail();
    gridRef.value?.submitWith(true);
  }

  function close() {
    layoutDrawer.close();
  }

  watch(() => props.drawerCode, reloadAll);
  onMounted(loadDetail);
</script>

<style lang="less" scoped>
  .schedule-detail {
    min-height: 100%;
    background: @card-bg-color;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 12px 20px;
    border-bottom: 1px solid @divider-color;
  }

  .detail-title {
    color: @text-primary-color;
    font-size: 16px;
    font-weight: 700;
  }

  .detail-code {
    margin-top: 2px;
    color: @text-secondary-color;
    font-size: 12px;
  }

  .detail-actions {
    display: flex;
    gap: 8px;
  }

  .detail-body {
    padding: 20px;
  }

  .logs-panel {
    margin-top: 20px;
  }

  .logs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .logs-title {
    color: @text-primary-color;
    font-size: 14px;
    font-weight: 600;
  }

  .logs-filter {
    width: 120px;
  }

  .logs-table {
    height: 420px;
  }
</style>
