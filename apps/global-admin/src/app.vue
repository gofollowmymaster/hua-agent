<template>
  <ConfigProvider
    :theme="{ token: { ...aplusToken, ...antvToken } }"
    :namespace="namespace"
  >
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <div v-else class="app-boot-state">
        <Spin size="large" tip="正在验证登录状态" />
      </div>
    </RouterView>
  </ConfigProvider>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import { Spin } from '@aplus-frontend/antdv';
  import { ConfigProvider, aplusToken } from '@aplus-frontend/ui';
  import { antvToken } from '@/config/token-preset';

  const namespace = import.meta.env.VITE_AUTH_PLATFORM || 'global-admin';
</script>

<style scoped>
  .app-boot-state {
    display: grid;
    min-height: 100vh;
    background: @fill-hover-color;
    place-items: center;
  }
</style>
