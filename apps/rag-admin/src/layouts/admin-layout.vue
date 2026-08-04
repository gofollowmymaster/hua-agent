<template>
  <Layout class="app-shell">
    <LayoutSider class="app-sider" :width="232">
      <div class="brand">
        <div class="brand-mark">R</div>
        <div>
          <div class="brand-title">RAG 管理后台</div>
          <div class="brand-subtitle">Knowledge Console</div>
        </div>
      </div>

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
        <div>
          <div class="header-title">{{ currentTitle }}</div>
          <div class="header-subtitle">RAG 文档与对话运营后台</div>
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
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  type MenuProps,
} from '@aplus-frontend/antdv';
import { ApButton } from '@aplus-frontend/ui';
import { adminMenus } from '@/router/routes';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const userInitial = computed(() => userStore.displayName.slice(0, 1).toUpperCase());
const selectedKeys = computed(() => [String(route.name || 'documents')]);
const currentTitle = computed(() => String(route.meta.title || 'RAG 管理后台'));

const menuItems = computed<ItemType[]>(() =>
  adminMenus.map((menu) => ({
    key: menu.name,
    label: menu.title,
    title: menu.title,
  })),
);

const userMenuItems: ItemType[] = [
  {
    key: 'logout',
    label: '退出登录',
    title: '退出登录',
  },
];

const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
  const menu = adminMenus.find((item) => item.name === key);
  if (menu && route.path !== menu.path) {
    void router.push(menu.path);
  }
};

const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
  if (key === 'logout') userStore.logout();
};
</script>
