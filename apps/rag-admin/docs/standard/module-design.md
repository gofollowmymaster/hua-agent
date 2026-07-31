# RAG Admin 模块设计规范

本文规定 `apps/rag-admin/src` 下新增或修改文件的放置规则。

## 目录职责

- `api/`：axios 实例、拦截器和业务 API 方法。
- `auth/`：登录中心、token cookie 和鉴权前端逻辑。
- `layouts/`：跨页面布局组件。
- `router/`：路由实例、路由表和路由守卫。
- `stores/`：Pinia store。
- `stores/modules/`：按业务拆分 store 模块。
- `styles/`：全局样式。
- `views/`：页面级组件。
- `views/components/`：页面域内复用组件。当前用于文档片段抽屉、文档预览弹窗等页面相关组件。

## 新增页面

新增页面时：

- 页面组件放入 `views/`。
- 路由配置放入 `router/routes.ts`。
- 需要统一布局时复用 `AdminLayout.vue` 或既有布局。
- 页面中的表格、表单、详情、弹窗、抽屉等后台标准交互优先使用 `@aplus-frontend/ui` 或基于 aplus-ui 的既有封装。
- 页面调用 `api/` 中的业务方法，不直接散写 axios 请求。
- 页面负责组合组件和编排局部状态，不承载多个独立业务职责。
- 页面文件接近 300 行时先评估拆分；不得超过 400 行。

## 新增组件

新增组件时：

- 页面私有或页面域内复用组件放入 `views/components/`。
- 跨页面稳定复用后，再考虑新增更通用的组件目录；新增前必须确认真实复用需求。
- 组件文件使用 `PascalCase.vue`。
- 新增业务组件优先组合 aplus-ui 成熟组件；只有 aplus-ui 不满足职责时才从更底层控件实现。
- 组件只负责一个明确展示或交互职责，例如一个抽屉、一个预览弹窗、一个筛选区域。
- 子组件通过 props/emits 与页面协作，不直接绕过页面调用无关 store 或路由逻辑。

## 新增业务请求

新增请求时：

- 在 `api/rag-admin.ts` 或对应业务 API 文件中封装。
- 复用 `api/http.ts` 的 axios 实例。
- 明确请求参数和响应类型。
- 涉及后端接口变化时同步检查 API app 的 DTO、Controller 和 Service。
- API 类型命名使用业务语义，例如 `RagDocumentItem`、`RagSessionPageParams`。
- 同一业务域请求优先放在同一 API 文件；文件接近 400 行时再按业务子域拆分。

## 状态管理

只有跨组件共享、需要缓存或需要统一生命周期的数据才进入 Pinia。页面局部状态优先留在组件内。

store 模块放在 `stores/modules/`，文件名使用业务名。store 只管理跨页面状态和生命周期，不处理 DOM、不直接承担复杂页面展示逻辑。

## 抽象边界

不要为单个页面提前抽象过多通用层。只有多个页面真实复用时，再抽出 composable、store 或共享组件。

## 单一职责检查

新增或修改文件时检查：

- 一个文件是否只有一个主要职责。
- 页面是否只负责组合和编排，而不是同时处理请求封装、数据缓存、复杂转换和多个弹窗细节。
- 组件是否可以通过名称看出用途。
- API、auth、store、router、styles 是否仍在各自目录中维护。
- 单文件是否低于 400 行。
