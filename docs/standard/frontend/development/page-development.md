# 管理后台页面开发通用方案

## 适用范围

本文档适用于管理后台的页面开发通用规则。它定义页面开发的稳定口径，不定义 AI 执行步骤；具体执行流程由页面开发 skill（如 `fd-page-dev`）承接。

应用级架构事实（目录结构、API 契约、路由与状态）见所在应用 `docs/architecture/` 对应文档；本文只规定页面开发规则。

## 基本原则

- 优先复用当前仓库、当前业务域的既有模式。
- UI 组件优先使用应用既有全局组件和 `@aplus-frontend/ui`；只有既有业务能力或 APlus UI 组件无法覆盖时，才使用 `@aplus-frontend/antdv`，不要为单个页面引入新 UI 库。
- 使用不熟悉的 `@aplus-frontend/ui` 组件、props 或 demo 前，必须按 `aplus-ui` skill 查询 API / demo，不凭记忆猜 props。
- 页面实现必须先遵循对应页面类型 pattern 文档（`docs/standard/frontend/development/table-pattern.md` / `form-pattern.md` / `detail-pattern.md`）中的公共约定，再决定是否新增页面私有实现。
- 页面实现应以真实业务语义拆分，避免为了“看起来统一”复制不适合本项目的权限、接口、路由和埋点。
- 页面文件保持编排清晰：复杂逻辑下沉到同级 hooks、components、sections。

## 文档优先级

页面开发时按以下顺序理解规则：

1. 根目录 `AGENTS.md`
2. 所在应用的 `AGENTS.md`
3. 所在应用的架构入口（前端 app 为 `apps/*/standard/architecture/README.md`，后端为 `docs/architecture/README.md`）
4. 所在应用的规范索引（前端 app 为 `apps/*/standard/development/README.md`，后端为 `docs/standard/README.md`）
5. `docs/standard/frontend/architecture/README.md`
6. `docs/standard/frontend/development/page-structure-blueprint.md`
7. `docs/standard/frontend/development/page-implementation-best-practices.md`
8. 本次页面类型对应的 pattern 文档
9. 真实代码、配置文件与目录结构

若标准文档与真实代码冲突，以真实代码和更细层级 `AGENTS.md` 为准，并在交付说明中写明差异。

## 页面落位

- 页面统一按 `docs/standard/frontend/development/page-structure-blueprint.md` 使用 `src/views/<page>/index.vue`。
- 模块内被多个 section 或页面复用的公共展示组件放在 `components/`。
- 业务弹窗、抽屉和页面区块按业务模块放在 `sections/`。
- 应用内跨页面稳定复用组件放在 `src/components/`。
- 页面私有逻辑放在页面同级 `hooks/`。

## API 与类型

请求封装、类型和接口契约规则见所在应用架构文档（如 `apps/*/standard/architecture/custom/auth-and-api-client.md`）；页面适配类型边界见 `docs/standard/frontend/development/page-structure-blueprint.md`。

## 权限与命名

命名规则见 `docs/standard/frontend/development/naming-conventions.md`；当前登录和鉴权实现事实见所在应用架构文档（如 `apps/*/standard/architecture/custom/auth-and-api-client.md`）。

## 枚举与字典

- 搜索项、表单下拉中的业务枚举优先使用后端返回的 `_text` 字段或统一枚举配置，禁止无依据写死本地 options。
- 后端同时返回 `xxx` 和 `xxx_text` 时，列表展示优先使用 `xxx_text`。
- 应用已有页面级状态枚举可继续沿用，新增业务枚举先确认是否可复用已有配置。

## 缓存与状态

状态管理规则见所在应用架构文档（如 `apps/*/standard/architecture/custom/project-architecture.md`）。

## 复用边界

文件放置和复用边界见 `docs/standard/frontend/development/directory-structure.md` 与 `docs/standard/frontend/development/page-structure-blueprint.md`。

## 禁止做法

- 在页面中内联新的底层请求封装。
- 手工修改后端接口契约或 shared 公共类型。
- 为单个页面引入新 UI 库。
- 页面之间直接引用彼此私有 hooks 或 components。
- 因目录相似而批量复制覆盖存量页面。
- 触发跨模块公共能力、复杂业务新增或新增封装的变更，绕过 OpenSpec 直接实现。
