<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">R</div>
        <div>
          <div class="brand-title">RAG 管理后台</div>
          <div class="brand-subtitle">Knowledge Console</div>
        </div>
      </div>

      <button
        class="nav-item"
        :class="{ active: currentView === 'documents' }"
        type="button"
        @click="currentView = 'documents'"
      >
        文档管理
      </button>
      <button
        class="nav-item"
        :class="{ active: currentView === 'sessions' }"
        type="button"
        @click="currentView = 'sessions'"
      >
        消息对话记录
      </button>

      <button class="logout" type="button" @click="logout">退出登录</button>
    </aside>

    <main class="main">
      <div v-if="loading" class="state">正在初始化登录状态...</div>
      <div v-else-if="error" class="state error-state">{{ error }}</div>
      <DocumentManager v-else-if="currentView === 'documents'" />
      <SessionRecords v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DocumentManager from './views/DocumentManager.vue';
import SessionRecords from './views/SessionRecords.vue';
import { ensureLogin, logout } from './auth/auth';

const loading = ref(true);
const error = ref('');
const currentView = ref<'documents' | 'sessions'>('documents');

onMounted(async () => {
  try {
    await ensureLogin();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});
</script>
