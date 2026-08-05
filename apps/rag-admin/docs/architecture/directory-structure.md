# RAG Admin 目录架构与模块设计

本文记录 `apps/rag-admin` 的目录结构事实，并承载新增或修改文件的放置规则。

## 顶层目录

- `apps/rag-admin/package.json`：前端依赖和 Vite 脚本。
- `apps/rag-admin/vite.config.ts`：Vite 插件、别名、proxy、base 和构建输出配置。
- `apps/rag-admin/src/`：前端源码。
- `apps/rag-admin/.env*`：前端环境变量，仅 `VITE_` 前缀会进入浏览器构建产物。
- `apps/rag-admin/tsconfig.json`：前端 TypeScript 配置。

## src 目录

- `main.ts`：Vue app 入口。
- `app.vue`：根组件。
- `api/`：axios 实例和业务 API 封装。
- `auth/`：登录中心、token cookie 和鉴权相关前端逻辑。
- `hooks/`：跨页面共享 hooks，例如文档预览弹窗 hook。
- `layouts/`：后台布局组件。
- `layouts/layout-drawer.vue`：全局详情抽屉容器。
- `layouts/layout-drawer/`：全局抽屉组件解析和 URL query 操作。
- `router/`：路由实例和路由表。
- `stores/`：Pinia store 入口和模块。
- `stores/modules/`：按业务拆分的 Pinia store 模块。
- `stores/modules/layout-drawer.ts`：全局抽屉状态 store。
- `styles/`：全局样式。
- `views/`：页面目录，页面入口统一为 `views/<page>/index.vue`。
- `views/<page>/components/`：模块内公共展示组件，供 sections 或多个页面复用。
- `views/<page>/sections/`：页面业务模块，包含页面区块、业务弹窗、业务抽屉；多页面共用的业务模块也放这里。
- `components/`：跨项目稳定复用组件，例如文档预览弹窗。
- `env.d.ts`：Vite/TypeScript 环境类型声明。

## 新增页面

新增页面时：

- 页面统一放入 `views/<page>/index.vue`，并按 `page-structure-blueprint.md` 组织同级 `hooks/`、`components/`、`sections/`。
- 模块内被多个 section 或页面复用的公共展示组件放入页面 `components/`。
- 业务弹窗、抽屉和页面区块按业务模块放入 `sections/`。
- 跨项目稳定复用组件放入 `src/components/`。
- 路由配置放入 `router/routes.ts`。
- 需要统一布局时复用 `admin-layout.vue` 或既有布局。
- 页面中的表格、表单、详情、弹窗、抽屉等后台标准交互优先使用 `@aplus-frontend/ui` 或基于 aplus-ui 的既有封装。
- 页面调用 `api/` 中的业务方法，不直接散写 axios 请求。
- 页面负责组合组件和编排局部状态，不承载多个独立业务职责。
- 页面文件接近 300 行时先评估拆分；不得超过 400 行。

## 新增组件

新增组件时：

- 模块内被多个 section 或页面复用的公共展示组件放入页面 `components/`。
- 业务弹窗、抽屉和页面区块按业务模块放入 `sections/`。
- 跨项目稳定复用组件放入 `src/components/`；新增前必须确认真实复用需求。
- 组件文件使用 `kebab-case.vue`。
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

- 只有跨组件共享、需要缓存或需要统一生命周期的数据才进入 Pinia。
- 页面局部状态优先留在组件内。
- store 模块放在 `stores/modules/`，文件名使用业务名。
- store 只管理跨页面状态和生命周期，不处理 DOM、不直接承担复杂页面展示逻辑。

## 抽象边界

- 不要为单个页面提前抽象过多通用层。
- 只有多个页面真实复用时，再抽出 composable、store 或共享组件。

## 单一职责检查

新增或修改文件时检查：

- 一个文件是否只有一个主要职责。
- 页面是否只负责组合和编排，而不是同时处理请求封装、数据缓存、复杂转换和多个弹窗细节。
- 组件是否可以通过名称看出用途。
- API、auth、store、router、styles 是否仍在各自目录中维护。
- 单文件是否低于 400 行。
