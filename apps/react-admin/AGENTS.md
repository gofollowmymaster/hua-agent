# AGENTS.md

## Scope

本文件适用于 `apps/react-admin/**`。同时遵守根 `AGENTS.md`、`docs/ai-governance/README.md` 和 `docs/standard/design/README.md`。

## Project

- Umi Max 4.7.22 + React 18.3.1 + TypeScript
- Ant Design 6.6.5 + `@ant-design/pro-components` 3.1.15-5 beta
- pnpm workspace；Node.js >= 22.12.0
- Vitest + React Testing Library；关键流程使用 Playwright

## Commands

```bash
pnpm dev                  # 开发服务，端口 5175
pnpm build                # 生产构建
pnpm typecheck            # TypeScript 只检查
pnpm lint:check           # ESLint 只检查
pnpm format:check         # Prettier 只检查
pnpm antd:info Button     # 查询当前 antd 版本的组件 API
pnpm antd:lint            # Ant Design 弃用、可访问性和用法检查
pnpm test                 # Vitest
pnpm e2e                  # Playwright 桌面与窄屏回归
pnpm check                # typecheck + lint + format + antd lint + unit test
```

根目录可使用对应的 `pnpm react-admin:*` 命令。`lint` 和 `format` 会改写文件，只有任务明确需要时才运行。

## Critical Rules

- 只使用 pnpm，不创建 npm/yarn lockfile；依赖版本与 workspace catalog/override 保持一致。
- 不编辑 `src/.umi*`，这些目录由 Umi 生成；开发缓存异常时删除生成目录并重启。
- 修改 antd 核心组件前先运行 `pnpm antd:info <Component>`，完成后运行 `pnpm antd:lint`，不得新增 deprecated、a11y、usage 或 performance 问题。
- ProComponents API 以当前安装版本的 TypeScript 类型和官方文档为准，不套用旧版示例。
- 不照搬上游模板的 React 19、Biome、Tailwind、Umi request/OpenAPI 或 npm 约定；引入这些能力必须单独设计和验证。
- 页面请求必须经过 `src/api/`，统一复用 `@aplus-sql/http-client`；不在页面创建 axios/fetch 客户端。
- 不导入 Vue 专属 `@aplus-sql/ui-kit` 或 `apps/rag-admin/src`。
- 登录、租户、token、路由和 API 行为以现有 `rag-admin` 实现为兼容基线。
- 列表优先使用 ProTable，表单使用 ProForm，布局使用 ProLayout；URL 可恢复详情使用 `drawer`、`drawerCode` 驱动的全局 Drawer。
- 主题颜色从 `src/theme/` 的 token 或 CSS 变量读取，不新增脱离主题的硬编码颜色或全局 Ant Design 类名覆盖。
- 单个 TS/TSX 文件不超过 400 行；新增或实质修改类及类方法时添加简洁 JSDoc。

## Architecture

- `.umirc.ts`：构建、插件、环境变量和代理配置。
- `config/routes.ts`：声明路由、redirect 和 wrapper。
- `src/app.tsx`：根 ConfigProvider、locale、主题变量和全局样式。
- `src/models/`、`src/auth/`：认证 model、租户解析和持久化兼容。
- `src/api/`：后端契约与请求封装。
- `src/layouts/`：ProLayout、菜单和 query 驱动的全局 Drawer。
- `src/theme/`：Ant Design、ProLayout、紧凑密度和业务语义 token。
- `src/pages/<domain>/<page>/`：页面入口及其私有 service、类型、组件和测试。
- `e2e/`：按业务流程拆分的 spec；公共 mock 和页面断言放 `e2e/support/`。

## Working Style

- 实现前先查现有页面、API wrapper、主题 helper 和测试；优先扩展现有结构。
- 明确可验证的完成条件，先用最小测试复现或固定行为，再做最小范围修改。
- 不顺手重构无关代码；只清理本次修改直接产生的无用导入、变量和样式。
- 页面异步操作必须提供 loading、成功提示和用户可理解的失败反馈。
- 列表、抽屉和结果区域的分类与状态字段使用 `SemanticTag`。

## Verification

- 常规改动至少运行 `pnpm check` 和 `pnpm build`。
- 涉及登录、导航、Drawer、上传、预览或聊天时追加 `pnpm e2e`。
- 依赖或 workspace override 变更追加 `pnpm why`、Vue Admin 构建、HTTP client 构建和根 `pnpm build`。
