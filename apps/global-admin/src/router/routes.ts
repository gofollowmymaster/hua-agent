import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/admin-layout.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/tenants',
    children: [
      {
        path: 'tenants',
        name: 'tenants',
        component: () => import('@/views/tenants/index.vue'),
        meta: {
          title: '租户管理',
          menuTitle: '租户管理',
          menuGroup: '平台管理'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/tenants'
  }
];
