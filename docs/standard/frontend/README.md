# 前端管理后台公共架构与规范

`docs/standard/frontend/` 存放多个前端管理后台 app（`apps/rag-admin`、`apps/global-admin`）共用的架构约定与开发规范。各 app 特有架构事实保留在各自 `apps/*/standard/architecture/custom/`，特有规范可放在各自 `apps/*/standard/development/` 补充。

两个前端 app 通过软连接引用本目录文档（如 `apps/*/standard/development/*.md`），共享文档更新后各 app 自动生效；不需要公用的内容请保留在各 app 目录内。

## 阅读顺序

0. `architecture/README.md`：共用架构约定（技术栈与入口、请求/路由/store 规则、数据流、构建运行、抽象边界）。
1. `development/directory-structure.md`：顶层目录与 src 目录职责、模块代码文件放置规则。
2. `development/code-style.md`：Vue/TypeScript 基本写法、组件和错误处理规则。
3. `development/page-structure-blueprint.md`：新增和复杂页面的目录标准。
4. `development/page-development.md`：页面开发通用规则和复用边界。
5. `development/page-implementation-best-practices.md`：组件、hooks、AgGrid、表单、弹框、详情展示的推荐写法。
6. `development/table-pattern.md` / `development/form-pattern.md` / `development/detail-pattern.md`：按页面类型落地的列表、表单、详情方案。
7. `development/naming-conventions.md`：路由、页面、API、类型、常量和未来权限/埋点命名。
8. `development/styling.md`：全局样式、组件样式和 UI 组件使用规范。

## 使用方式

- 各 app 的 `AGENTS.md` 与 `standard/development/README.md` 会声明哪些文档来自本目录（软连接）、哪些是 app 特有文档。
- 修改共享规范时直接改本目录文件；app 内通过软连接同步生效。
- app 特有差异（参考实现、认证、租户、构建事实等）写在各 app `standard/architecture/custom/`，不回写本目录。

## 与其他文档的分工

- 整体产品设计规范：`docs/standard/design/README.md`（前端、UI、交互相关任务必读）。
- 共享包规范：`packages/ui-kit/docs/standard/README.md`、`packages/http-client/docs/standard/README.md`。
- AI 工作流与验证：`docs/ai-governance/README.md`。
