import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import type { LocationQuery } from 'vue-router';
import type { LayoutDrawerContent } from '@/stores/modules/layout-drawer';

export type DrawerKey = 'tenant-detail' | 'schedule-detail';

const componentMap: Record<DrawerKey, Component> = {
  'tenant-detail': defineAsyncComponent(
    () => import('@/views/tenants/sections/tenant-detail/index.vue')
  ),
  'schedule-detail': defineAsyncComponent(
    () => import('@/views/schedules/sections/schedule-detail/index.vue')
  )
};

export function resolveDrawerFromQuery(
  query: LocationQuery
): Omit<LayoutDrawerContent, 'visible'> | null {
  const drawer = query.drawer;
  const drawerCode = query.drawerCode;
  if (
    drawer === 'tenant-detail' &&
    typeof drawerCode === 'string' &&
    drawerCode
  ) {
    return {
      component: componentMap[drawer],
      data: { drawerCode }
    };
  }
  if (
    drawer === 'schedule-detail' &&
    typeof drawerCode === 'string' &&
    drawerCode
  ) {
    return {
      component: componentMap[drawer],
      data: { drawerCode }
    };
  }
  return null;
}
