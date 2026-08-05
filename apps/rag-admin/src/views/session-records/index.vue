<template>
  <section class="page">
    <header class="page-header compact">
      <div>
        <h1>消息对话记录</h1>
        <p>按会话查看用户提问与助手回答。</p>
      </div>
    </header>

    <div class="grid-fill">
      <AgGrid :columns="columns" v-bind="gridProps">
        <template #title>
          <ApButton type="primary" @click="refresh">刷新</ApButton>
        </template>
      </AgGrid>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import {
  AgGrid,
  ApButton,
  ApTag,
  usePageListAgGrid,
  type AgGridColumnType,
} from '@aplus-frontend/ui';
import { pageSessionsGrid, type RagSessionItem } from '@/api/rag-admin';
import { useRowClickAction } from '@/hooks/use-row-click-action';

const route = useRoute();
const { onRowClick, getPointerRowClassName, clickAction } =
  useRowClickAction('sessions');

const columns: AgGridColumnType<RagSessionItem>[] = [
  {
    title: '渠道',
    key: 'channel',
    dataIndex: 'channel',
    valueType: 'text',
    width: 110,
    fieldProps: {
      placeholder: 'http / wecom',
      field: {
        allowClear: true,
      },
    },
    customRender: ({ record }) =>
      h(ApTag, {
        text: record.channel || '-',
        color: '#1677ff',
      }),
  },
  {
    title: '用户',
    key: 'userId',
    dataIndex: 'userId',
    valueType: 'text',
    width: 140,
    fieldProps: {
      placeholder: 'user id',
      field: {
        allowClear: true,
      },
    },
    customRender: ({ record }) => record.userId || '-',
  },
  {
    title: '关键词',
    key: 'keyword',
    dataIndex: 'keyword',
    valueType: 'text',
    hideInTable: true,
    fieldProps: {
      placeholder: '会话 / 消息',
      field: {
        allowClear: true,
      },
    },
  },
  {
    title: '会话',
    key: 'sessionKey',
    dataIndex: 'sessionKey',
    minWidth: 220,
    flex: 1,
    hideInSearch: true,
    customRender: ({ record }) =>
      h('div', [
        h('div', { class: 'strong' }, record.conversationId || record.sessionKey || '-'),
        h('div', { class: 'muted path' }, record.sessionKey || '-'),
      ]),
  },
  {
    title: '消息数',
    key: 'messageCount',
    dataIndex: 'messageCount',
    width: 90,
    hideInSearch: true,
    customRender: ({ record }) =>
      h(ApTag, {
        text: `${record.messageCount || 0} 条`,
        color: '#1677ff',
      }),
  },
  {
    title: '最后消息',
    key: 'latestMessage',
    dataIndex: 'latestMessage',
    minWidth: 220,
    flex: 1,
    hideInSearch: true,
    ellipsis: true,
    customRender: ({ record }) =>
      h('div', { class: 'session-preview' }, record.latestMessage?.content || '暂无消息'),
  },
  {
    title: '最后活跃',
    key: 'lastActiveAt',
    dataIndex: 'lastActiveAt',
    width: 150,
    hideInSearch: true,
    customRender: ({ record }) => formatTime(record.lastActiveAt),
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
      if (!record) {
        return {};
      }
      return {
        actions: [
          clickAction({ text: '查看消息' }),
        ],
      };
    },
  },
];

const [gridProps, { reload }] = usePageListAgGrid({
  api: pageSessionsGrid,
  rowKey: 'id',
  onRowClicked(record, event) {
    onRowClick(event, {
      query: {
        ...route.query,
        drawer: 'session-messages',
        drawerCode: record.id,
      },
      replace: Boolean(route.query.drawer),
    });
  },
  rowClassName: getPointerRowClassName(),
  rowHeight: 62,
  isShowRowSelection: false,
  adaptive: true,
  searchForm: {
    colon: false,
  },
  wrapperStyle: {
    height: '100%',
  },
  scroll: {
    x: 1040,
  },
});

function refresh() {
  reload();
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
</script>

<style scoped>
.strong {
  font-weight: 700;
}

.session-preview {
  overflow: hidden;
  color: #404b5b;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
