# RAG Admin 页面开发通用方案

## 适用范围

本文档适用于 RAG Admin 的页面开发通用规则。它定义页面开发的稳定口径，不定义 AI 执行步骤；具体执行流程由 `fd-page-dev` skill 承接。

当前项目架构事实见 `../../architecture/project-architecture.md` 和 `../../architecture/directory-structure.md`；本文只规定页面开发规则。

## 基本原则

- 优先复用当前仓库、当前业务域的既有模式。
- UI 组件优先使用项目既有全局组件和 `@aplus-frontend/ui`；只有既有业务能力或 APlus UI 组件无法覆盖时，才使用 `@aplus-frontend/antdv`，不要为单个页面引入新 UI 库。
- 使用不熟悉的 `@aplus-frontend/ui` 组件、props 或 demo 前，必须按 `aplus-ui` skill 查询 API / demo，不凭记忆猜 props。
- 页面实现必须先遵循对应页面类型 pattern 文档（`table-pattern.md` / `form-pattern.md` / `detail-pattern.md`）中的公共约定，再决定是否新增页面私有实现。
- 页面实现应以真实业务语义拆分，避免为了“看起来统一”复制不适合本项目的权限、接口、路由和埋点。
- 页面文件保持编排清晰：复杂逻辑下沉到同级 hooks、components、sections。

## 文档优先级

页面开发时按以下顺序理解规则：

1. 根目录 `AGENTS.md`
2. `apps/rag-admin/AGENTS.md`
3. `apps/rag-admin/docs/architecture/README.md`
4. `apps/rag-admin/docs/standard/README.md`
5. `apps/rag-admin/docs/standard/development/page-structure-blueprint.md`
6. `apps/rag-admin/docs/standard/development/page-implementation-best-practices.md`
7. 本次页面类型对应的 pattern 文档
8. 真实代码、配置文件与目录结构

若标准文档与真实代码冲突，以真实代码和更细层级 `AGENTS.md` 为准，并在交付说明中写明差异。

## 页面落位

- 页面统一按 `page-structure-blueprint.md` 使用 `src/views/<page>/index.vue`。
- 页面私有组件放在页面同级 `components/`，跨页面稳定复用组件放在 `src/components/`。
- 页面私有逻辑放在页面同级 `hooks/`、`components/`、`sections/`。

## API 与类型

请求封装、类型和接口契约规则见 `../../architecture/auth-and-api-client.md`；页面适配类型边界见 `page-structure-blueprint.md`。

## 权限与命名

命名规则见 `naming-conventions.md`；当前登录和鉴权实现事实见 `../../architecture/auth-and-api-client.md`。

## 枚举与字典

- 搜索项、表单下拉中的业务枚举优先使用后端返回的 `_text` 字段或统一枚举配置，禁止无依据写死本地 options。
- 后端同时返回 `xxx` 和 `xxx_text` 时，列表展示优先使用 `xxx_text`。
- 当前项目已有页面级状态枚举可继续沿用，新增业务枚举先确认是否可复用已有配置。

## 缓存与状态

状态管理规则见 `../../architecture/project-architecture.md`。

## 复用边界

文件放置和复用边界见 `../../architecture/directory-structure.md` 与 `page-structure-blueprint.md`。

## 禁止做法

- 在页面中内联新的底层请求封装。
- 手工修改后端接口契约或 shared 公共类型。
- 为单个页面引入新 UI 库。
- 页面之间直接引用彼此私有 hooks 或 components。
- 因目录相似而批量复制覆盖存量页面。
- 触发跨模块公共能力、复杂业务新增或新增封装的变更，绕过 OpenSpec 直接实现。
