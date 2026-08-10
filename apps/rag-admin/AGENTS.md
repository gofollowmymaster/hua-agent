# AGENTS.md

## 适用范围

本文件只适用于 `apps/rag-admin` Vue/Vite 前端应用。monorepo 根规则见 `../../AGENTS.md`；后端规则见 `../api/AGENTS.md`。

## 技术栈

- **框架**: Vue 3 + Vite + TypeScript
- **路由**: Vue Router，当前使用 hash 路由
- **状态管理**: Pinia
- **请求**: axios + `@ai-sdk/vue` / `ai`
- **UI**: `@aplus-frontend/ui`、`@aplus-frontend/antdv`
- **登录**: `@aplus-frontend/aplus-auth-sdk`
- **文件预览**: `@open-file-viewer/*`、`pdfjs-dist`

## 必读文档

RAG Admin 任务按需读取：

- RAG Admin 架构入口：`standard/architecture/README.md`
- RAG Admin 规范索引：`standard/development/README.md`
- 多前端 app 共用架构约定与共享规范索引：`../../docs/standard/frontend/architecture/README.md`、`../../docs/standard/frontend/README.md`
- 前端构建与运行：`standard/architecture/custom/build-and-runtime.md`
- 前端 API client 规范：`standard/architecture/custom/auth-and-api-client.md`
- 目录与模块设计（共享规范，软连接到 `docs/standard/frontend/development/`）：`standard/development/directory-structure.md`
- 项目架构与路由状态：`standard/architecture/custom/project-architecture.md`
- 页面结构与开发（共享规范，软连接到 `docs/standard/frontend/development/`）：`standard/development/page-structure-blueprint.md`、`standard/development/page-development.md`
- 页面实现最佳实践：`standard/development/page-implementation-best-practices.md`
- 页面类型规范：`standard/development/table-pattern.md`、`standard/development/form-pattern.md`、`standard/development/detail-pattern.md`
- 命名规范：`standard/development/naming-conventions.md`
- 整体产品设计规范：`../../docs/standard/design/README.md`
- 页面开发执行：`../../.agents/skills/fd-page-dev/SKILL.md`，涉及 `@aplus-frontend/ui` 时同时读 `../../.agents/skills/aplus-ui/SKILL.md`
- 涉及后端接口契约时，补读 `../api/docs/architecture/README.md` 和 `../api/docs/standard/README.md`

本文档中的 `src/` 默认指 `apps/rag-admin/src/`。

## 常用命令

在 `apps/rag-admin` 目录内执行：

```bash
pnpm dev               # Vite 开发服务，host 0.0.0.0
pnpm dev:test          # Vite test mode 开发服务
pnpm build             # vue-tsc --noEmit && vite build
pnpm build:test        # test mode 类型检查和构建
pnpm preview           # Vite preview
pnpm lint              # ESLint 9 flat config，自动修复可自动修复的问题
pnpm lint:check        # ESLint 只检查，不修改文件
pnpm format            # Prettier 按 prettier.config.cjs 格式化代码与配置文件
pnpm format:check      # Prettier 只检查，不修改文件
pnpm stylelint         # Stylelint 按 stylelint.config.cjs 检查样式，自动修复可修复问题
pnpm stylelint:check   # Stylelint 只检查，不修改文件
```

根目录兼容命令：

```bash
pnpm admin:dev
pnpm admin:build
pnpm admin:preview
pnpm admin:lint
pnpm admin:lint:check
pnpm admin:format
pnpm admin:format:check
pnpm admin:stylelint
pnpm admin:stylelint:check
```

## 环境变量

前端使用 Vite 环境加载机制，不使用 API 的 `pnpm env:* -- ...`。

环境文件位于本目录：

- `.env`
- `.env.development`
- `.env.local`
- `.env.test`
- `.env.production`

只有 `VITE_` 前缀变量会进入浏览器构建产物。不要在前端环境文件或源码中放入数据库连接串、JWT secret、飞书 secret、机器人 secret、后端固定 token 等敏感信息。

开发代理：

- `VITE_API_PROXY_TARGET` 控制 `/ai` 代理目标。
- 未配置时默认代理到 `http://localhost:3000`。

## 构建与访问

`vite.config.ts` 当前事实：

- `base`: `/public/rag-admin/`
- dev server 端口：`5174`
- 路径别名：`@` → `src`
- 构建输出：`../api/public/rag-admin`
- proxy：`/api` → `VITE_API_PROXY_TARGET`（转发时去掉 `/api` 前缀）

生产构建产物由 API app 的静态资源服务提供访问。修改 `base`、`outDir`、proxy 或静态资源路径时，必须同时检查 API app 文档、根 `AGENTS.md` 和 `docs/ai-governance/README.md`。

## 目录边界

- `src/main.ts`：Vue app 入口。
- `src/app.vue`：根组件。
- `src/api/`：`common/` 存放公共 HTTP 客户端和公共类型，`<module>/<menu>.ts` 按模块和菜单拆分业务 API 方法。
- `src/layouts/`：布局组件。
- `src/router/`：路由实例、路由表和路由守卫。
- `src/stores/`：Pinia store。
- `src/stores/modules/user/`：用户 store、登录中心、token cookie 和租户认证配置。
- `src/styles/`：全局样式。
- `src/views/`：页面级组件。
- `src/views/<page>/index.vue`：页面统一入口目录结构，页面私有逻辑放同级 `hooks/`、`components/`、`sections/`。

页面组件不直接创建 axios 实例，不手动拼接 `Authorization`，不直接引用 `apps/api/src` 内部路径。

## 前端实现规则

- 页面开发强制优先使用 `@aplus-frontend/ui`。表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等常见后台场景，默认先查并使用 aplus-ui 的成熟组件。
- 编写或改造 aplus-ui 组件前先查询组件 API 和示例，不凭记忆猜 props；必要时使用 `aplus info <Component> --format json`、`aplus demo <Component> ... --format json`。
- 只有 aplus-ui 没有合适能力、现有业务封装已覆盖，或有明确技术原因时，才使用 `@aplus-frontend/antdv`、原生控件或新增自定义封装，并在代码/交付说明中说明取舍。
- 页面级组件放 `src/views/`，跨页面布局放 `src/layouts/`。
- 页面统一按 `standard/development/page-structure-blueprint.md` 使用 `src/views/<page>/index.vue`，页面私有逻辑放同级 `hooks/`、`components/`、`sections/`。
- 跨页面稳定复用组件放 `src/components/`。
- 请求统一封装到 `src/api/`，复用 `src/api/common/http.ts`。
- token 读写统一通过 `src/stores/modules/user/token.ts`，登录流程集中在 `src/stores/modules/user/` 或路由守卫。
- 跨页面共享或需要缓存的数据才进入 Pinia；页面局部状态优先留在组件内。
- 全局样式放 `src/styles/global.css`，页面私有样式优先放对应 `.vue` 文件。
- 不新增第二套同职责 UI 框架。

## Cross-app 规则

涉及 API 路径、HTTP 方法、请求参数、响应字段、鉴权方式、错误语义或 shared 类型时：

- 同步检查后端 DTO、Controller、Service 和 Guard。
- 同步更新 `src/api/` 类型和所有页面调用方。
- 同时运行或说明 API 侧验证。
- 不把后端 Prisma model 或内部 Service 类型直接复制为前端契约；稳定跨端类型才考虑进入 `packages/shared`。

## 验证

- 前端代码变更至少运行 `pnpm build`；在根目录可运行 `pnpm admin:build`。
- 涉及 test mode 行为时运行 `pnpm build:test`。
- 涉及 dev server、proxy、登录跳转或运行时交互时，必要时运行 `pnpm dev` 并做人工验证。
- 只改文档时不需要跑前端构建，但要做路径和引用静态校验。
