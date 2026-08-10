import { RouterView, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/admin-layout.vue';

export interface AdminMenuItem {
  name: string;
  title: string;
}

export interface AdminMenuGroup {
  name: string;
  title: string;
  children: AdminMenuItem[];
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/knowledge/documents',
    children: [
      {
        path: 'knowledge',
        name: 'knowledge-qa',
        component: RouterView,
        redirect: '/knowledge/documents',
        meta: {
          menuTitle: '知识问答',
        },
        children: [
          {
            path: 'documents',
            name: 'documents',
            component: () =>
              import('@/views/knowledge/document-manager/index.vue'),
            meta: {
              title: '文档管理',
              menuTitle: '文档管理',
              subtitle:
                '查看、维护或删除已索引文档，也可触发 raw 目录重新入库。',
            },
          },
          {
            path: 'sessions',
            name: 'sessions',
            component: () =>
              import('@/views/knowledge/session-records/index.vue'),
            meta: {
              title: '消息对话记录',
              menuTitle: '消息对话记录',
              subtitle: '按会话查看用户提问与助手回答。',
            },
          },
          {
            path: 'assistant',
            name: 'assistant',
            component: () =>
              import('@/views/knowledge/assistant-demo/index.vue'),
            meta: {
              title: '问答助手',
              menuTitle: '问答助手',
              subtitle: '基于当前 RAG 文档索引的 AGUI 协议演示会话。',
            },
          },
        ],
      },
      {
        path: 'business-agent',
        name: 'business-agent',
        component: RouterView,
        redirect: '/business-agent/knowledge',
        meta: {
          menuTitle: '业务Agent',
        },
        children: [
          {
            path: 'knowledge',
            name: 'agent-knowledge',
            component: () =>
              import('@/views/business-agent/knowledge/index.vue'),
            meta: {
              title: '业务知识库管理',
              menuTitle: '业务知识库管理',
              subtitle:
                '查看、维护已入库的业务 Agent 文档，并可触发 docs 目录重新入库。',
            },
          },
          {
            path: 'skills',
            name: 'agent-skills',
            component: () => import('@/views/business-agent/skills/index.vue'),
            meta: {
              title: 'Skill 管理',
              menuTitle: 'Skill 管理',
              subtitle: '业务 Agent 模块骨架。',
            },
          },
          {
            path: 'sessions',
            name: 'agent-sessions',
            component: () =>
              import('@/views/business-agent/sessions/index.vue'),
            meta: {
              title: '会话管理',
              menuTitle: '会话管理',
              subtitle: '业务 Agent 模块骨架。',
            },
          },
          {
            path: 'config',
            name: 'agent-config',
            component: () => import('@/views/business-agent/config/index.vue'),
            meta: {
              title: '配置中心',
              menuTitle: '配置中心',
              subtitle: '业务 Agent 模块骨架。',
            },
          },
          {
            path: 'demo',
            name: 'agent-demo',
            component: () => import('@/views/business-agent/demo/index.vue'),
            meta: {
              title: '演示 Demo',
              menuTitle: '演示 Demo',
              subtitle: '业务 Agent 模块骨架。',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/documents',
    redirect: '/knowledge/documents',
  },
  {
    path: '/sessions',
    redirect: '/knowledge/sessions',
  },
  {
    path: '/assistant',
    redirect: '/knowledge/assistant',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/knowledge/documents',
  },
];

const adminRoute = routes[0];

function createAdminMenus(route: RouteRecordRaw): AdminMenuGroup[] {
  return (route.children ?? []).flatMap((group) => {
    const { name, meta } = group;
    const title = meta?.menuTitle;

    if (typeof name !== 'string' || typeof title !== 'string') return [];

    const children = (group.children ?? []).flatMap((item) => {
      const itemTitle = item.meta?.menuTitle;

      if (typeof item.name !== 'string' || typeof itemTitle !== 'string') {
        return [];
      }

      return [{ name: item.name, title: itemTitle }];
    });

    return [{ name, title, children }];
  });
}

export const adminMenus: AdminMenuGroup[] = createAdminMenus(adminRoute);
