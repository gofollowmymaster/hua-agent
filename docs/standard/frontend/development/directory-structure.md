# 管理后台目录与模块代码文件组织结构规范

本文规定管理后台应用的顶层目录、`src` 目录职责和模块代码文件放置规则，适用于所有接入本规范的 Vue/Vite 管理后台 app。各 app 的真实目录事实（具体文件与业务模块）以所在应用 `standard/architecture/custom/` 文档与代码为准。

## 顶层目录

- `<app>/package.json`：前端依赖和 Vite/Vitest 脚本。
- `<app>/vite.config.ts`：Vite 插件、别名、proxy、base 和构建输出配置。
- `<app>/src/`：前端源码。
- `<app>/.env*`：前端环境变量，仅 `VITE_` 前缀会进入浏览器构建产物。
- `<app>/tsconfig.json`：前端 TypeScript 配置。

## src 目录职责

- `main.ts`：Vue app 入口。
- `app.vue`：根组件，提供 aplus-ui ConfigProvider 和命名空间。
- `api/`：axios 实例（`http.ts`）和业务 API 封装。
- `config/`：全局 UI 主题与 Design Token 预设、认证等应用级配置。
- `layouts/`：后台布局组件。
- `layouts/admin-layout.vue`：应用主布局（品牌、菜单、用户操作、内容区）。
- `layouts/layout-drawer.vue`：全局详情抽屉容器。
- `layouts/layout-drawer/`：全局抽屉组件解析和 URL query 操作。
- `router/`：路由实例、路由表和路由守卫。
- `stores/`：Pinia store 入口和模块。
- `stores/modules/`：按业务拆分的 Pinia store 模块。
- `stores/modules/layout-drawer.ts`：全局抽屉状态 store。
- `stores/modules/user/`：用户 store、登录 SDK、token cookie、认证配置及相关测试。
- `styles/`：全局样式。
- `views/`：页面目录，页面入口统一为 `views/<page>/index.vue`。
- `views/<page>/components/`：模块内公共展示组件，供 sections 或多个页面复用。
- `views/<page>/sections/`：页面业务模块，包含页面区块、业务弹窗、业务抽屉；多页面共用的业务模块也放这里。
- `env.d.ts`：Vite/TypeScript 环境类型声明。

## 模块代码文件放置规则

- 页面：`src/views/<page>/index.vue`；页面私有逻辑放同级 `hooks/`、`components/`、`sections/`，详见 `docs/standard/frontend/development/page-structure-blueprint.md`。
- 请求：业务 API 方法统一放 `src/api/` 对应业务文件，页面不直接创建 axios 实例，不手动拼接 `Authorization`。
- 状态：跨页面共享或需要缓存的状态放 `src/stores/modules/`；页面局部状态优先留在组件内。
- 组件：应用内跨页面稳定复用组件放 `src/components/`；模块内公共展示组件放 `views/<page>/components/`；业务弹窗、抽屉和页面区块放 `sections/`；跨应用稳定复用组件进 `packages/ui-kit`。
- 类型：请求/响应类型靠近 API 封装放置；页面视图模型和适配类型放页面目录的 `interface.ts`、`hooks/` 或 `helper/`。
- 常量与工具：模块内跨页面复用的方法与常量放 `helper/`；页面级常量放页面目录或同级 helper，不上提到全局。
- 认证：用户认证逻辑统一放在认证相关 store 模块（如 `stores/modules/user/`），页面和组件不自行实现鉴权。

## 抽象边界与复用边界

- 不为单个页面提前抽象过多通用层；只有多个页面真实复用时，再抽出 composable、store 或共享组件。
- 页面只负责组合和状态编排，不同时承担请求封装、数据缓存、复杂转换和多个弹窗细节。
- 禁止页面之间直接引用彼此私有 `hooks/`、`components/` 或 `sections/`。
- 不新增同职责平行目录；文件、目录统一使用 `kebab-case`，页面入口统一为 `index.vue`。
- 单文件不超过 400 行，接近上限时拆分组件、API 类型、工具函数或 store。

## 与其他文档的职责边界

- 页面级目录标准（`views/<page>/` 内部结构）：`docs/standard/frontend/development/page-structure-blueprint.md`。
- 命名口径：`docs/standard/frontend/development/naming-conventions.md`。
- 跨应用复用、请求/路由/store 规则与构建运行：`docs/standard/frontend/architecture/README.md`。
- 各 app 真实目录事实与历史兼容口径：所在应用 `standard/architecture/custom/` 对应文档与代码。
