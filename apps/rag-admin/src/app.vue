<template>
  <ConfigProvider>
    <RouterView />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ConfigProvider } from '@aplus-frontend/ui';
</script>
