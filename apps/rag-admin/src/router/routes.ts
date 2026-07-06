import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';

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
        component: () => import('@/views/DocumentManager.vue'),
        meta: {
          title: '文档管理',
          menuTitle: '文档管理',
        },
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/views/SessionRecords.vue'),
        meta: {
          title: '消息对话记录',
          menuTitle: '消息对话记录',
        },
      },
      {
        path: 'assistant',
        name: 'assistant',
        component: () => import('@/views/AssistantDemo.vue'),
        meta: {
          title: '问答助手',
          menuTitle: '问答助手',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/documents',
  },
];
