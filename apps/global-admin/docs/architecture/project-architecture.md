# Global Admin 项目架构

应用通过 `src/main.ts` 注册 Pinia 和 Vue Router，`app.vue` 提供 aplus-ui ConfigProvider。`admin-layout.vue` 负责总控台品牌、菜单、用户操作、内容区和全局 LayoutDrawer。

首期只有 `/tenants` 路由。租户详情由 `drawer=tenant-detail&drawerCode=<tenantCode>` 驱动；LayoutDrawer 监听 query 并动态加载详情 section，关闭时只清理 drawer 参数。

`src/views/` 只放页面业务组合，`src/api/` 维护后端契约，`src/stores/` 维护跨页面状态，`src/layouts/` 维护应用壳层。共享能力只能通过 workspace package 公共入口消费。
