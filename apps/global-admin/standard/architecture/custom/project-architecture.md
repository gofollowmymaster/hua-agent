# Global Admin 项目架构与路由状态

本文记录 `apps/global-admin` 的特有架构事实；两个前端 app 共用的架构约定（启动链路、目录职责、路由/store 规则、数据流）见 `docs/standard/frontend/architecture/README.md`。

## 启动链路

前端入口位于 `apps/global-admin/src/main.ts`。应用启动时创建 Vue app，注册 Pinia（`src/stores/index.ts`）和 Vue Router（`src/router/index.ts`），然后挂载到页面根节点。

`app.vue` 是前端根组件，通过 aplus-ui `ConfigProvider` 注入主题 token 和命名空间；后台布局位于 `src/layouts/admin-layout.vue`，全局抽屉容器位于 `src/layouts/layout-drawer.vue`，路由定义位于 `src/router/`。当前路由使用 hash 模式，适配由 API app 静态资源目录提供的访问方式。

## 页面结构

当前主要页面包括：

- `tenants/index.vue`：租户目录总览。
- `tenants/sections/tenant-detail/index.vue`：租户详情（全局抽屉内容）。
- `schedules/index.vue`：定时任务管理。
- `schedules/sections/schedule-detail/index.vue`：任务详情与执行记录（全局抽屉内容）。

业务弹窗、抽屉和页面区块位于对应页面目录的 `sections/`。

## 路由组织

- `/tenants` 承载租户管理，`/schedules` 承载定时任务管理，均挂在 `AdminLayout` 下，根路径重定向到 `/tenants`。
- 未知路径重定向到 `/tenants`。
- 路由守卫 `router.beforeEach` 统一调用 `prepareGlobalAdminRoute`（`src/router/route-auth.ts`）完成登录准备并设置页面标题。

## 状态与请求

- 用户 store 位于 `src/stores/modules/user/index.ts`。
- 登录 SDK、token 持久化（pinia-plugin-persistedstate + `localStorage['authToken']`）和 user store 一起位于 `src/stores/modules/user/`。
- 全局详情抽屉状态位于 `src/stores/modules/layout-drawer.ts`。
- 后端请求通过 `src/api/http.ts` 的 axios 实例和 `src/api/global-admin.ts`、`src/api/schedule.ts` 的业务 API 方法封装。

## 详情抽屉

- 详情统一由全局 LayoutDrawer 承载，URL query `drawer=<section>&drawerCode=<code>` 驱动（如租户详情 `drawer=tenant-detail&drawerCode=<tenantCode>`）。
- 抽屉组件解析在 `src/layouts/layout-drawer/component-map.ts`，URL query 操作在 `src/layouts/layout-drawer/use-layout-drawer.ts`；关闭时只清理 drawer 参数。

## 与 API app 的关系

Global Admin 开发态通过 Vite proxy 将 `/global-admin` 请求转发到 API 后端。生产态构建产物输出到 `apps/api/public/global-admin`，由 API app 的静态资源服务提供访问。

前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。

更多页面开发规则见 `docs/standard/frontend/` 共享规范与 `apps/global-admin/standard/development/`。
