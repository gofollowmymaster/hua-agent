# RAG Admin 页面开发通用方案

## 适用范围

本文档适用于 RAG Admin 的页面开发通用规则。它定义页面开发的稳定口径，不定义 AI 执行步骤；具体执行流程由 `fd-page-dev` skill 承接。

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
5. `apps/rag-admin/docs/standard/page-structure-blueprint.md`
6. `apps/rag-admin/docs/standard/page-implementation-best-practices.md`
7. 本次页面类型对应的 pattern 文档
8. 真实代码、配置文件与目录结构

若标准文档与真实代码冲突，以真实代码和更细层级 `AGENTS.md` 为准，并在交付说明中写明差异。

## 页面落位

- 页面统一按 `page-structure-blueprint.md` 使用 `src/views/<page>/index.vue`。
- 页面私有组件放在页面同级 `components/`，跨页面稳定复用组件放在 `src/views/components/`。
- 页面私有逻辑放在页面同级 `hooks/`、`components/`、`sections/`。

## API 与类型

- 请求统一封装到 `src/api/`，复用 `src/api/http.ts`。
- 页面组件调用业务 API 方法，不直接散写 URL、请求头、token 注入或 axios 拦截器。
- 类型定义覆盖当前页面实际使用的请求、响应、表单数据。
- 类型导入使用 `import type`。
- 涉及后端接口变化时，同步检查后端 DTO、Controller、Service 和 shared 类型。
- 若接口字段暂未生成，页面可使用页面级适配类型承接，并在交付说明中标记“待接口补齐”。

## 权限与命名

- 当前项目路由由登录守卫统一控制，页面不自行实现登录或鉴权。
- 若未来引入页面路由权限或按钮操作权限，遵循 `naming-conventions.md`，不临时发明权限常量。
- 路由、页面、API、类型和常量命名遵循 `naming-conventions.md`。

## 枚举与字典

- 搜索项、表单下拉中的业务枚举优先使用后端返回的 `_text` 字段或统一枚举配置，禁止无依据写死本地 options。
- 后端同时返回 `xxx` 和 `xxx_text` 时，列表展示优先使用 `xxx_text`。
- 当前项目已有页面级状态枚举可继续沿用，新增业务枚举先确认是否可复用已有配置。

## 缓存与状态

- 页面局部状态优先留在组件内。
- 跨页面共享或需要缓存的数据才进入 Pinia。
- 当前项目没有多标签页缓存链路，不为统一而额外引入 localStorage、sessionStorage 或自定义缓存 hook。

## 复用边界

- 页面内局部复用：放页面自己的 `hooks/`、`components/`、`sections/`。
- 模块内跨页面复用：放模块级 `components/`、`helper/`。
- 跨页面稳定复用：放 `src/views/components/`。
- 页面之间不直接引用彼此私有 hooks 或 components。
- 新增公共能力前，先确认 `@aplus-frontend/ui` 或项目内是否已有同名或相近能力。

## 禁止做法

- 在页面中内联新的底层请求封装。
- 手工修改后端接口契约或 shared 公共类型。
- 为单个页面引入新 UI 库。
- 页面之间直接引用彼此私有 hooks 或 components。
- 因目录相似而批量复制覆盖存量页面。
- 触发跨模块公共能力、复杂业务新增或新增封装的变更，绕过 OpenSpec 直接实现。
