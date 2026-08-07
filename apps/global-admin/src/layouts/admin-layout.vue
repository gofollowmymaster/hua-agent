<template>
  <Layout class="app-shell">
    <LayoutSider class="app-sider" :width="224">
      <div class="brand">
        <div class="brand-mark">G</div>
        <div class="brand-copy">
          <div class="brand-title">Global Admin</div>
          <div class="brand-subtitle">平台总控台</div>
        </div>
      </div>

      <div class="menu-group-label">平台管理</div>
      <Menu
        class="side-menu"
        mode="inline"
        theme="dark"
        :items="menuItems"
        :selected-keys="selectedKeys"
        @click="handleMenuClick"
      />
    </LayoutSider>

    <Layout>
      <LayoutHeader class="app-header">
        <div class="header-title">{{ currentTitle }}</div>
        <Dropdown>
          <ApButton class="user-trigger" type="text">
            <Avatar size="small">{{ userInitial }}</Avatar>
            <span>{{ userStore.displayName }}</span>
          </ApButton>
          <template #overlay>
            <Menu :items="userMenuItems" @click="handleUserMenuClick" />
          </template>
        </Dropdown>
      </LayoutHeader>

      <LayoutContent class="main">
        <Spin :spinning="userStore.loginLoading">
          <Alert
            v-if="userStore.loginError"
            type="error"
            show-icon
            :message="userStore.loginError"
          />
          <RouterView v-else />
        </Spin>
        <LayoutDrawer />
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { RouterView, useRoute, useRouter } from 'vue-router';
  import {
    Alert,
    Avatar,
    Dropdown,
    Layout,
    LayoutContent,
    LayoutHeader,
    LayoutSider,
    Menu,
    Spin,
    type ItemType,
    type MenuProps
  } from '@aplus-frontend/antdv';
  import { ApButton } from '@aplus-frontend/ui';
  import LayoutDrawer from '@/layouts/layout-drawer.vue';
  import { useUserStore } from '@/stores/modules/user';

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const selectedKeys = computed(() => [String(route.name || 'tenants')]);
  const currentTitle = computed(() => String(route.meta.title || '总控台'));
  const userInitial = computed(() =>
    userStore.displayName.slice(0, 1).toUpperCase()
  );

  const menuItems: ItemType[] = [
    { key: 'tenants', label: '租户管理', title: '租户管理' },
    { key: 'schedules', label: '定时任务管理', title: '定时任务管理' }
  ];
  const userMenuItems: ItemType[] = [
    { key: 'logout', label: '退出登录', title: '退出登录' }
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'tenants' && route.name !== key) {
      void router.push({ name: 'tenants' });
    }
    if (key === 'schedules' && route.name !== key) {
      void router.push({ name: 'schedules' });
    }
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') userStore.logout();
  };
</script>

<style lang="less" scoped>
  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  .app-shell :deep(.ant-layout) {
    min-width: 0;
  }

  .app-sider {
    min-height: 100vh;
    background: @sider-dark-bg-color;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 72px;
    padding: 18px;
    color: @sider-brand-text-color;
  }

  .brand-mark {
    display: grid;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: @sider-brand-bg-color;
    color: @text-primary-color;
    font-weight: 800;
    place-items: center;
  }

  .brand-copy {
    min-width: 0;
  }

  .brand-title {
    font-size: 15px;
    font-weight: 700;
  }

  .brand-subtitle,
  .menu-group-label {
    color: @text-tertiary-color;
    font-size: 12px;
  }

  .menu-group-label {
    padding: 12px 24px 6px;
  }

  .side-menu {
    border-inline-end: 0;
    background: transparent;
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 20px;
    border-bottom: 1px solid @border-color;
    background: @card-bg-color;
  }

  .header-title {
    color: @text-primary-color;
    font-size: 17px;
    font-weight: 700;
  }

  .user-trigger {
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    max-width: 220px;
  }

  .user-trigger span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: calc(100vh - 60px);
    padding: 12px;
    overflow: hidden;
    background: @fill-hover-color;
  }

  .main :deep(.ant-spin-nested-loading),
  .main :deep(.ant-spin-container) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  @media (max-width: 760px) {
    .app-sider {
      display: none;
    }

    .app-header {
      height: 52px;
      padding: 0 12px;
    }

    .header-title {
      font-size: 16px;
    }

    .user-trigger {
      width: 36px;
      padding-inline: 2px;
    }

    .user-trigger span:last-child {
      display: none;
    }

    .main {
      height: calc(100vh - 52px);
      padding: 8px;
    }
  }
</style>
