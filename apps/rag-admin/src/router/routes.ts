import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/admin-layout.vue';

export const adminMenus = [
  {
    path: '/documents',
    name: 'documents',
    title: '文档管理',
  },
  {
    path: '/sessions',
    name: 'sessions',
    title: '消息对话记录',
  },
  {
    path: '/assistant',
    name: 'assistant',
    title: '问答助手',
  },
] as const;

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/documents',
    children: [
      {
        path: 'documents',
        name: 'documents',
        component: () => import('@/views/document-manager/index.vue'),
        meta: {
          title: '文档管理',
          menuTitle: '文档管理',
          subtitle: '查看、维护或删除已索引文档，也可触发 raw 目录重新入库。',
        },
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/views/session-records/index.vue'),
        meta: {
          title: '消息对话记录',
          menuTitle: '消息对话记录',
          subtitle: '按会话查看用户提问与助手回答。',
        },
      },
      {
        path: 'assistant',
        name: 'assistant',
        component: () => import('@/views/assistant-demo/index.vue'),
        meta: {
          title: '问答助手',
          menuTitle: '问答助手',
          subtitle: '基于当前 RAG 文档索引的 AGUI 协议演示会话。',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/documents',
  },
];
