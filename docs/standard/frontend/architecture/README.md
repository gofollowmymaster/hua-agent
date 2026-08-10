# 前端管理后台通用架构约定

`docs/standard/frontend/architecture/` 按类别存放多个前端管理后台 app（`apps/rag-admin`、`apps/global-admin`）共用的 Vue/Vite 架构约定与事实，后续可按请求/路由/构建等类别在本目录新增文档。各 app 特有事实保留在各自 `apps/*/standard/architecture/custom/`，共享页面开发规范见 `docs/standard/frontend/development/`，各 app 特有规范保留在各自 `apps/*/standard/development/`。

## 技术栈与入口

- 技术栈：Vue 3 + Vite + TypeScript + Vue Router + Pinia + axios，UI 使用 `@aplus-frontend/ui` / `@aplus-frontend/antdv`。
- 应用入口 `src/main.ts`，根组件 `src/app.vue`（承载 aplus-ui ConfigProvider），后台布局 `src/layouts/admin-layout.vue`。
- 全局详情抽屉统一使用 LayoutDrawer：URL query 的 `drawer` / `drawerCode` 驱动动态加载详情 section，关闭时只清理 drawer 参数。

## src 目录职责

`src/` 顶层目录职责、模块代码文件放置规则与抽象边界见 `docs/standard/frontend/development/directory-structure.md`；页面级目录结构见 `docs/standard/frontend/development/page-structure-blueprint.md`。

## 跨项目复用

- 跨项目稳定复用的组件、hooks 放入 `packages/ui-kit`，并通过公开 exports 暴露，不导入 app 业务源码。
- 通用 HTTP client 放入 `packages/http-client`：`createHttpClient` 提供 base URL、token 注入、业务 envelope 与 401 处理。
- 各 app 只在 `src/api/common/http.ts` 保留本应用的 base URL、token 获取与退出登录适配。

## 请求封装规则

- axios 实例通过 `createHttpClient` 在 `src/api/common/http.ts` 统一创建，不在页面或业务 API 文件中重复配置 interceptor。
- 业务请求方法按“模块目录 + 菜单文件”维护在 `src/api/<module>/<menu>.ts`，同一模块放在同一目录，同一菜单放在同一文件；公共类型、分页参数清洗等定义统一放 `src/api/common/`。
- 页面组件只调用业务 API 方法，不直接创建 axios 实例，不手动拼接 `Authorization`。
- 单个 API 文件不超过 400 行，超过时按业务子域拆分。
- 修改请求路径、HTTP 方法、参数/响应字段、错误语义或鉴权方式时，同步检查 API app 的 DTO、Controller、Service 和 Guard，并检查所有前端调用方。
- 页面负责展示用户可理解的错误、加载和空状态；业务 API 方法保留后端错误的可排查信息。

## 状态管理

- 只有跨组件共享、需要缓存或需要统一生命周期的数据才进入 Pinia；页面局部状态优先留在组件内。
- store 模块放在 `src/stores/modules/`，文件名使用业务名。
- store 负责状态生命周期和数据获取编排，不处理 DOM、不直接承担复杂页面展示逻辑；展示格式化优先放页面 computed 或组件内。

## 路由规则

- 路由配置集中维护在 `src/router/routes.ts`，实例与守卫在 `src/router/index.ts`。
- 路由 path 使用短横线 kebab-case，避免拼音、无意义缩写或过深层级；路由 `name` 使用稳定语义化名称。
- 页面组件文件使用 `kebab-case.vue`。
- 新增路由时确认页面标题、布局、鉴权要求和默认跳转行为。

## 数据流

```text
view -> api method -> http client -> API app
view -> store -> api method -> http client -> API app
```

- 页面不绕过 API 封装直接请求后端，store 不依赖后端内部源码。
- 前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。

## 构建与运行

- Vite 构建，路径别名 `@` 指向各 app 的 `src`。
- 只有 `VITE_` 前缀环境变量会进入浏览器构建产物；前端环境文件与构建产物不得包含数据库连接串、机器人/JWT secret、后端固定 token 等敏感信息。
- 生产构建产物输出到 `apps/api/public/<app>`，`base` 为 `/public/<app>/`，由 API app 的静态资源服务提供访问。
- 开发态通过 Vite proxy 将业务请求转发到 API 后端；各 app 的代理路径、端口与环境文件见各自 `apps/*/standard/architecture/custom/build-and-runtime.md`。

## 抽象边界与单一职责

- 不为单个页面提前抽象过多通用层；只有多个页面真实复用时，再抽出 composable、store 或共享组件。
- 单文件不超过 400 行，接近上限时拆分组件、API 类型、工具函数或 store。
- 页面只负责组合和编排，不同时承担请求封装、数据缓存、复杂转换和多个弹窗细节。
