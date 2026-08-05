<template>
  <ApDrawer
    v-model:open="open"
    :width="width"
    :closable="false"
    :mask="false"
    destroy-on-close
    :body-style="{ padding: 0 }"
    :header-style="{ display: 'none' }"
    class="layout-drawer-container"
  >
    <component v-if="context" :is="context.component" v-bind="context.data" />
  </ApDrawer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ApDrawer } from '@aplus-frontend/ui';
import { useLayoutDrawerStore } from '@/stores/modules/layout-drawer';
import { resolveDrawerFromQuery } from './layout-drawer/component-map';
import { useLayoutDrawer } from './layout-drawer/use-layout-drawer';

const props = withDefaults(
  defineProps<{
    width?: string | number;
  }>(),
  {
    width: '60%',
  },
);

const route = useRoute();
const layoutDrawerStore = useLayoutDrawerStore();
const layoutDrawer = useLayoutDrawer();
const { context } = storeToRefs(layoutDrawerStore);

const open = computed({
  get: () => Boolean(context.value?.visible),
  set: (visible: boolean) => {
    if (!visible) {
      layoutDrawer.close();
    }
  },
});

function handleDocumentClick(event: MouseEvent) {
  if (!context.value?.visible) return;

  const path = (event.composedPath?.() || []) as EventTarget[];
  const drawerEl = document.querySelector('.layout-drawer-container');
  const isInDrawer = drawerEl && path.includes(drawerEl);
  const target = event.target;
  const isRowClick =
    target instanceof Element && Boolean(target.closest('.ag-row'));

  if (!isInDrawer && !isRowClick) {
    layoutDrawer.close();
  }
}

watch(
  () => route.query,
  (query) => {
    const content = resolveDrawerFromQuery(query);
    if (content) {
      layoutDrawerStore.open(content);
    } else {
      layoutDrawerStore.close();
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>
