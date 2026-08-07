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
                @change="handleResultFilterChange"
              />
            </div>
            <Table
              :data-source="logs"
              :columns="logColumns"
              :loading="logsLoading"
              :pagination="pagination"
              row-key="id"
              size="small"
              @change="handleTableChange"
            />
          </div>
        </template>
      </Spin>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, h, onMounted, ref, watch } from 'vue';
  import {
    Alert,
    Select,
    Spin,
    message,
    type TableColumnsType
  } from '@aplus-frontend/antdv';
  import {
    ApButton,
    ApDescriptions,
    ApModal,
    ApTag,
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
  const logsLoading = ref(false);
  const triggering = ref(false);
  const errorMessage = ref('');
  const detail = ref<ScheduledTaskDetail>();
  const logs = ref<ScheduledTaskLogItem[]>([]);
  const logResult = ref<ScheduledTaskRunResult | undefined>();
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

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

  const logColumns: TableColumnsType<ScheduledTaskLogItem> = [
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

  const pagination = computed(() => ({
    current: page.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    showTotal: (count: number) => `共 ${count} 条`
  }));

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

  async function loadLogs(
    targetPage = page.value,
    targetPageSize = pageSize.value
  ) {
    logsLoading.value = true;
    try {
      const result = await listScheduleLogs(props.drawerCode, {
        result: logResult.value,
        page: targetPage,
        pageSize: targetPageSize
      });
      logs.value = result.list;
      total.value = result.total;
      page.value = result.page;
      pageSize.value = result.pageSize;
    } catch (error) {
      logs.value = [];
      total.value = 0;
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      logsLoading.value = false;
    }
  }

  function handleResultFilterChange() {
    loadLogs(1);
  }

  function handleTableChange(paginationConfig: {
    current?: number;
    pageSize?: number;
  }) {
    loadLogs(paginationConfig.current || 1, paginationConfig.pageSize || 10);
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
          await loadLogs(1);
        } finally {
          triggering.value = false;
        }
      }
    });
  }

  function reloadAll() {
    loadDetail();
    loadLogs(1);
  }

  function close() {
    layoutDrawer.close();
  }

  watch(() => props.drawerCode, reloadAll);
  onMounted(reloadAll);
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
</style>
