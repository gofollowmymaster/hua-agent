# Global Admin 开发规范

`apps/global-admin/standard/development/` 记录本 app 的开发规范。本目录下 `.md` 文档（除 `README.md`）均为 `docs/standard/frontend/development/` 共享规范的软连接，更新共享规范即自动生效；本 app 自有 `table-pattern.md`（含参考实现与两种数据模式）见 `../architecture/custom/table-pattern.md`。

## 阅读顺序

0. `docs/standard/frontend/architecture/README.md`：多前端 app 共用架构约定（请求/路由/store 规则、数据流、构建运行）。
1. `directory-structure.md`（共享）：顶层目录与 src 目录职责、模块代码文件放置规则。
2. `code-style.md`（共享）：Vue/TypeScript 基本写法、组件和错误处理规则。
3. `page-structure-blueprint.md`（共享）：新增和复杂页面的目录标准。
4. `page-development.md`（共享）：页面开发通用规则和复用边界。
5. `page-implementation-best-practices.md`（共享）：组件、hooks、AgGrid、表单、弹框、详情展示的推荐写法。
6. `../architecture/custom/table-pattern.md`（本 app 自有）/ `form-pattern.md`（共享） / `detail-pattern.md`（共享）：按页面类型落地的列表、表单、详情方案。
7. `naming-conventions.md`（共享）：路由、页面、API、类型、常量和未来权限/埋点命名。
8. `../architecture/custom/auth-and-api-client.md`：登录、token、axios、接口契约和错误处理规范。
9. `../architecture/custom/project-architecture.md`：Global Admin 特有页面、路由组织与状态位置。
10. `styling.md`（共享）：全局样式、组件样式和 UI 组件使用规范。

整体产品设计规范见 [根目录产品设计规范](../../../../docs/standard/design/README.md)。

## 高频硬规则

- 页面开发强制优先使用 `@aplus-frontend/ui`。表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等后台常见能力默认使用 aplus-ui 成熟组件。
- 列表页搜索栏与表格必须使用 AgGrid 系列组件（`AgGrid` + `usePageListAgGrid`），禁止手写独立搜索表单或使用 antdv `Table` 系列组件/类型；antdv Table 导入由 ESLint `no-restricted-imports` 拦截，详见 `../architecture/custom/table-pattern.md`。
- 使用 aplus-ui 前先查组件 API、类型和示例；不要凭记忆猜 props。必要时使用 `aplus info <Component> --format json` 和 `aplus demo <Component> ... --format json`。
- 只有 aplus-ui 不满足场景、项目已有封装更合适，或存在明确技术限制时，才使用 `@aplus-frontend/antdv`、原生控件或新增自定义组件，并说明原因。
- 单个 `.vue`、`.ts` 文件不超过 400 行；接近上限时拆分组件、API 类型、工具函数或 store。
- 遵循单一职责原则：页面负责组合和状态编排，API 文件负责请求，store 负责跨页面状态，组件负责展示和局部交互。
- 命名和文件名遵循 `code-style.md` 与 `directory-structure.md`，不要新增同职责平行目录或随意缩写。

## 验证入口

前端代码变更至少运行：

```bash
pnpm global-admin:test
pnpm global-admin:build
pnpm global-admin:lint:check
pnpm global-admin:stylelint:check
```

登录、proxy 或抽屉交互变更需要浏览器 smoke test。具体验证矩阵见 `docs/ai-governance/testing-and-verification.md`。
