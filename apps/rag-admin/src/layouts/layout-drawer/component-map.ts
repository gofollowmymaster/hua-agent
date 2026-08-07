import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import type { LocationQuery } from 'vue-router';
import type { LayoutDrawerContent } from '@/stores/modules/layout-drawer';

export type DrawerKey = 'document-chunks' | 'session-messages';

const componentMap: Record<DrawerKey, Component> = {
  'document-chunks': defineAsyncComponent(
    () =>
      import(
        '@/views/knowledge/document-manager/sections/document-chunk-panel/index.vue'
      ),
  ),
  'session-messages': defineAsyncComponent(
    () =>
      import(
        '@/views/knowledge/session-records/sections/session-messages-panel/index.vue'
      ),
  ),
};

export function resolveDrawerFromQuery(
  query: LocationQuery,
): Omit<LayoutDrawerContent, 'visible'> | null {
  const drawer = query.drawer;
  const drawerCode = query.drawerCode;

  if (
    (drawer === 'document-chunks' || drawer === 'session-messages') &&
    typeof drawerCode === 'string' &&
    drawerCode
  ) {
    return {
      component: componentMap[drawer],
      data: {
        drawerCode,
      },
    };
  }

  return null;
}
