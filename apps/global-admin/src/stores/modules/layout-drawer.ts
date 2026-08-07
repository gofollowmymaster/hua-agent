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

  function open(content: Omit<LayoutDrawerContent, 'visible'>) {
    context.value = { ...content, visible: true };
  }

  function close() {
    if (context.value) context.value = { ...context.value, visible: false };
  }

  return { context, open, close };
});
