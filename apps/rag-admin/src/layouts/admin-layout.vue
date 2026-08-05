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
import LayoutDrawer from '@/layouts/layout-drawer.vue';
import { adminMenus } from '@/router/routes';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const userInitial = computed(() =>
  userStore.displayName.slice(0, 1).toUpperCase(),
);
const selectedKeys = computed(() => [String(route.name || 'documents')]);
const currentTitle = computed(() => String(route.meta.title || 'RAG 管理后台'));
const currentSubtitle = computed(() =>
  String(route.meta.subtitle || 'RAG 文档与对话运营后台'),
);

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

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.app-shell :deep(.ant-layout) {
  min-width: 0;
}

.app-sider {
  min-height: 100vh;
  background: #18202d;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 76px;
  padding: 20px 18px;
  color: #eef3f8;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
  color: #17202c;
  background: #9ee6c7;
  font-weight: 800;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 2px;
  color: #9aa7b5;
  font-size: 12px;
}

.side-menu {
  border-inline-end: 0;
  background: transparent;
}

.app-header {
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #e6ebf1;
  background: #ffffff;
}

.header-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
}

.header-subtitle {
  margin-top: 2px;
  color: #7b8797;
  font-size: 12px;
  line-height: 18px;
}

.user-trigger {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  color: #263244 !important;
}

.user-trigger :deep(span:last-child) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main {
  display: flex;
  height: calc(100vh - 64px);
  min-width: 0;
  min-height: calc(100vh - 64px);
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
  background: #f4f6f8;
}

.main :deep(.ant-spin-nested-loading),
.main :deep(.ant-spin-container) {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.state {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: #667386;
}

.error-state {
  color: #b42318;
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
