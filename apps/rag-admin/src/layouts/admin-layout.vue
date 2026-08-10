<template>
  <Layout class="app-shell">
    <LayoutSider class="app-sider" :width="232">
      <div class="brand">
        <div class="brand-mark">{{ brandMark }}</div>
        <div>
          <div class="brand-title">{{ brandTitle }}</div>
          <div class="brand-subtitle">Knowledge Console</div>
        </div>
      </div>

      <Menu
        class="side-menu"
        mode="inline"
        theme="dark"
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @update:open-keys="handleOpenKeysChange"
        @click="handleMenuClick"
      />
    </LayoutSider>

    <Layout>
      <LayoutHeader class="app-header">
        <div>
          <div class="header-title">{{ currentTitle }}</div>
          <div class="header-subtitle">{{ currentSubtitle }}</div>
        </div>

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
          <div v-if="userStore.loginError" class="state error-state">
            {{ userStore.loginError }}
          </div>
          <RouterView v-else />
        </Spin>
        <LayoutDrawer />
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { RouterView, useRoute, useRouter } from 'vue-router';
  import {
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
  import { adminMenus } from '@/router/routes';
  import { useUserStore } from '@/stores/modules/user';

  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();

  const userInitial = computed(() =>
    userStore.displayName.slice(0, 1).toUpperCase()
  );
  const brandMark = computed(() => userStore.supplierCode);
  const brandTitle = computed(() => `${userStore.tenantDisplayName}管理后台`);
  const selectedKeys = computed(() => [String(route.name || 'documents')]);
  const currentTitle = computed(() =>
    String(route.meta.title || brandTitle.value)
  );
  const currentSubtitle = computed(() =>
    String(route.meta.subtitle || 'RAG 文档与对话运营后台')
  );
  const openKeys = ref<string[]>([]);
  const leafMenus = adminMenus.flatMap((group) => group.children);

  const menuItems = computed<ItemType[]>(() =>
    adminMenus.map((group) => ({
      key: group.name,
      label: group.title,
      title: group.title,
      children: group.children.map((menu) => ({
        key: menu.name,
        label: menu.title,
        title: menu.title
      }))
    }))
  );

  const userMenuItems: ItemType[] = [
    {
      key: 'logout',
      label: '退出登录',
      title: '退出登录'
    }
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const menu = leafMenus.find((item) => item.name === key);
    if (menu && route.name !== menu.name) {
      void router.push({ name: menu.name });
    }
  };

  function handleOpenKeysChange(keys: Array<string | number>) {
    openKeys.value = keys.map(String);
  }

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') userStore.logout();
  };

  watch(
    () => String(route.name || ''),
    (name) => {
      const group = adminMenus.find((item) =>
        item.children.some((menu) => menu.name === name)
      );
      openKeys.value = group ? [group.name] : [];
    },
    { immediate: true }
  );
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
    height: 76px;
    padding: 20px 18px;
    color: @sider-brand-text-color;
  }

  .brand-mark {
    display: grid;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: @sider-brand-bg-color;
    color: @text-primary-color;
    font-weight: 800;
    place-items: center;
  }

  .brand-title {
    font-size: 16px;
    font-weight: 700;
  }

  .brand-subtitle {
    margin-top: 2px;
    color: @text-tertiary-color;
    font-size: 12px;
  }

  .side-menu {
    border-inline-end: 0;
    background: transparent;
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 24px;
    border-bottom: 1px solid @border-color;
    background: @card-bg-color;
  }

  .header-title {
    color: @text-primary-color;
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
  }

  .header-subtitle {
    margin-top: 2px;
    color: @text-secondary-color;
    font-size: 12px;
    line-height: 18px;
  }

  .user-trigger {
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    max-width: 220px;
    color: @text-primary-color !important;
  }

  .user-trigger :deep(span:last-child) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: calc(100vh - 64px);
    min-height: calc(100vh - 64px);
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

  .state {
    display: grid;
    min-height: 160px;
    place-items: center;
    color: @text-secondary-color;
  }

  .error-state {
    color: @red-color;
  }

  @media (max-width: 900px) {
    .app-shell {
      min-width: 720px;
    }

    .app-sider {
      min-height: 100vh;
    }
  }
</style>
