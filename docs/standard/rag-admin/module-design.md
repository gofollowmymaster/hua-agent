# RAG Admin 模块设计规范

本文规定 `apps/rag-admin/src` 下新增或修改文件的放置规则。

## 目录职责

- `api/`：axios 实例、拦截器和业务 API 方法。
- `auth/`：登录中心、token cookie 和鉴权前端逻辑。
- `layouts/`：跨页面布局组件。
- `router/`：路由实例、路由表和路由守卫。
- `stores/`：Pinia store。
- `styles/`：全局样式。
- `views/`：页面级组件。

## 新增页面

新增页面时：

- 页面组件放入 `views/`。
- 路由配置放入 `router/routes.ts`。
- 需要统一布局时复用 `AdminLayout.vue` 或既有布局。
- 页面调用 `api/` 中的业务方法，不直接散写 axios 请求。

## 新增业务请求

新增请求时：

- 在 `api/rag-admin.ts` 或对应业务 API 文件中封装。
- 复用 `api/http.ts` 的 axios 实例。
- 明确请求参数和响应类型。
- 涉及后端接口变化时同步检查 API app 的 DTO、Controller 和 Service。

## 状态管理

只有跨组件共享、需要缓存或需要统一生命周期的数据才进入 Pinia。页面局部状态优先留在组件内。

## 抽象边界

不要为单个页面提前抽象过多通用层。只有多个页面真实复用时，再抽出 composable、store 或共享组件。
