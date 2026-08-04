import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Component } from 'vue';

export interface LayoutDrawerContent {
  component: Component;
  data: Record<string, unknown>;
  visible: boolean;
}

export const useLayoutDrawerStore = defineStore('layout-drawer', () => {
  const context = ref<LayoutDrawerContent | null>(null);
  const cache = ref<Record<string, LayoutDrawerContent>>({});

  function open(content: Omit<LayoutDrawerContent, 'visible'>) {
    setTimeout(() => {
      context.value = {
        ...content,
        visible: true,
      };
    }, 10);
  }

  function close(fullPath?: string) {
    if (context.value) {
      context.value = {
        ...context.value,
        visible: false,
      };
    }
    if (fullPath) {
      delete cache.value[fullPath];
    }
  }

  function setVisible(visible: boolean) {
    if (context.value) {
      context.value = {
        ...context.value,
        visible,
      };
    }
  }

  return {
    context,
    cache,
    open,
    close,
    setVisible,
  };
});
