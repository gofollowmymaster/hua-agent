<template>
  <ConfigProvider
    :theme="{ token: { ...aplusToken, ...antvToken } }"
    :namespace="namespace"
    :aplus-token="aplusUITokenPreset"
  >
    <RouterView />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ConfigProvider, aplusToken } from '@aplus-frontend/ui';
import { antvToken, aplusUITokenPreset } from '@/config/token-preset';

const namespace = import.meta.env.VITE_AUTH_PLATFORM || 'rag-admin';
</script>
