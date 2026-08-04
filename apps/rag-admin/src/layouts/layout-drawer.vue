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
    <component
      v-if="context"
      :is="context.component"
      v-bind="context.data"
    />
  </ApDrawer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ApDrawer } from '@aplus-frontend/ui';
import { useLayoutDrawerStore } from '@/stores/modules/layout-drawer';

const props = withDefaults(
  defineProps<{
    width?: string | number;
  }>(),
  {
    width: '80%',
  },
);

const route = useRoute();
const layoutDrawerStore = useLayoutDrawerStore();
const { context, cache } = storeToRefs(layoutDrawerStore);

const open = computed({
  get: () => Boolean(context.value?.visible),
  set: (visible: boolean) => layoutDrawerStore.setVisible(visible),
});

function handleDocumentClick(event: MouseEvent) {
  if (!context.value?.visible) return;

  const path = (event.composedPath?.() || []) as EventTarget[];
  const drawerEl = document.querySelector('.layout-drawer-container');
  const isInDrawer = drawerEl && path.includes(drawerEl);
  if (!isInDrawer) {
    layoutDrawerStore.close(route.fullPath);
  }
}

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (context.value?.visible && oldPath) {
      cache.value[oldPath] = {
        ...context.value,
        visible: false,
      };
    }

    const cached = cache.value[newPath];
    if (cached) {
      layoutDrawerStore.open(cached);
    } else {
      layoutDrawerStore.close(newPath);
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
