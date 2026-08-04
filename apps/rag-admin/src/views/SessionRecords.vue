<template>
  <section class="page split-page">
    <div class="list-pane">
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
    </div>

    <ApCard class="detail-pane" :padding="'16px'">
      <Empty v-if="!selected" description="选择一个会话查看消息详情" />
      <template v-else>
        <header class="detail-header">
          <div>
            <h2>{{ selected.conversationId || selected.sessionKey }}</h2>
            <p>{{ selected.channel }} · {{ selected.userId || '未知用户' }}</p>
          </div>
          <ApTag :text="`${selected.messageCount} 条`" color="#1677ff" />
        </header>
        <Spin :spinning="messageLoading">
          <div
            v-for="message in messages"
            :key="String(message.id)"
            class="message"
            :class="message.role"
          >
            <div class="message-meta">
              <span>{{ message.role === 'assistant' ? '助手' : '用户' }}</span>
              <span>{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
          <Empty v-if="!messageLoading && messages.length === 0" description="暂无消息" />
        </Spin>
      </template>
    </ApCard>
  </section>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import dayjs from 'dayjs';
import { Empty, Spin } from '@aplus-frontend/antdv';
import {
  AgGrid,
  ApButton,
  ApCard,
  ApTag,
  usePageListAgGrid,
  type AgGridColumnType,
} from '@aplus-frontend/ui';
import {
  listSessionMessages,
  pageSessionsGrid,
  type RagMessageItem,
  type RagSessionItem,
} from '@/api/rag-admin';

const messages = ref<RagMessageItem[]>([]);
const selected = ref<RagSessionItem | null>(null);
const messageLoading = ref(false);

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
          {
            text: '查看消息',
            onClick: () => select(record),
          },
        ],
      };
    },
  },
];

const [gridProps, { reload }] = usePageListAgGrid({
  api: async (params: Record<string, unknown>) => {
    const result = await pageSessionsGrid(params);

    if (
      selected.value &&
      !result.records.some((item) => item.id === selected.value?.id)
    ) {
      selected.value = null;
      messages.value = [];
    }

    return result;
  },
  rowKey: 'id',
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

async function select(item: RagSessionItem) {
  selected.value = item;
  messageLoading.value = true;
  try {
    messages.value = await listSessionMessages(item.id);
  } finally {
    messageLoading.value = false;
  }
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}
</script>
