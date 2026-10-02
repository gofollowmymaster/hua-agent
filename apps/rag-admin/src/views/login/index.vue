<template>
  <main class="login-page">
    <section class="login-panel" aria-labelledby="login-title">
      <div class="brand-mark">{{ tenant.supplierCode }}</div>
      <h1 id="login-title">{{ tenant.displayName }} 管理后台</h1>
      <p class="subtitle">知识库与业务 Agent 管理</p>

      <ApForm
        layout="vertical"
        auto-focus-first-input
        class="login-form"
        @finish="handleFinish"
      >
        <ApForm.FormItem
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <Input autocomplete="username" />
        </ApForm.FormItem>
        <ApForm.FormItem
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <InputPassword autocomplete="current-password" />
        </ApForm.FormItem>
        <ApButton html-type="submit" type="primary" block :loading="loading">
          登录
        </ApButton>
      </ApForm>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Input, InputPassword, message } from '@aplus-frontend/antdv';
  import { ApButton, ApForm } from '@aplus-frontend/ui';
  import { useRoute, useRouter } from 'vue-router';
  import { resolveTenantAuthConfig } from '@/stores/modules/user/tenant-auth.config';
  import { useUserStore } from '@/stores/modules/user';

  interface LoginForm {
    username: string;
    password: string;
  }

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const tenant = resolveTenantAuthConfig(window.location.hostname);
  const loading = ref(false);
  async function handleFinish(values: LoginForm) {
    loading.value = true;
    try {
      await userStore.login(values);
      const redirect =
        typeof route.query.redirect === 'string' ? route.query.redirect : '';
      await router.replace(
        redirect.startsWith('/') && redirect !== '/login'
          ? redirect
          : '/knowledge/documents'
      );
    } catch {
      message.error('用户名或密码错误');
    } finally {
      loading.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .login-page {
    display: grid;
    min-height: 100vh;
    padding: 24px;
    background: @fill-hover-color;
    place-items: center;
  }

  .login-panel {
    width: min(100%, 400px);
    padding: 36px;
    border: 1px solid @border-color;
    border-radius: 8px;
    background: @card-bg-color;
    box-shadow: 0 12px 32px rgb(34 48 73 / 12%);
  }

  .brand-mark {
    display: grid;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: @primary-color;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    place-items: center;
  }

  h1 {
    margin: 20px 0 4px;
    color: @text-primary-color;
    font-size: 20px;
    line-height: 28px;
  }

  .subtitle {
    margin: 0;
    color: @text-secondary-color;
    font-size: 13px;
    line-height: 20px;
  }

  .login-form {
    margin-top: 28px;
  }
</style>
