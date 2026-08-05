# RAG Admin 代码风格规范

本文规定 `apps/rag-admin` 的 Vue/TypeScript 基本写法。

## TypeScript

- 优先定义明确类型，避免新增无意义的 `any`。
- 接口响应类型优先靠近 API 封装放置；跨端稳定类型才考虑进入 `packages/shared`。
- 使用前端别名 `@` 引用 `apps/rag-admin/src` 内部代码。
- 不引用 `apps/api/src` 内部路径。
- 变量、函数、computed、ref 使用 `camelCase`。
- TypeScript interface/type、Vue 组件名、类名使用 `PascalCase`。
- 常量使用语义化名称；模块内固定常量可使用 `UPPER_SNAKE_CASE`。
- 布尔变量使用能表达状态的前缀或语义，例如 `isLoading`、`hasError`、`canSubmit`、`shouldRefresh`。

## Vue 组件

- 页面级组件放在 `src/views/`。
- 可复用布局放在 `src/layouts/`。
- 组件内复杂请求、鉴权和数据转换逻辑应下沉到 `api/`、`auth/` 或 store。
- 不在模板中堆叠复杂表达式；复杂展示逻辑放入 computed 或局部函数。
- 单个 `.vue` 文件不超过 400 行；接近上限时优先拆分子组件、组合函数、API 类型或纯工具函数。
- 组件只承担单一职责。一个组件不同时负责大块页面布局、远程请求、复杂数据转换和多个弹窗/抽屉交互。
- `<script setup lang="ts">` 是默认写法；保持同文件内模板、脚本、样式职责清晰。

## 文件命名

- 页面目录使用 `kebab-case`，页面入口统一为 `index.vue`，例如 `document-manager/index.vue`、`session-records/index.vue`。
- 布局组件文件使用 `kebab-case.vue`，例如 `admin-layout.vue`。
- 模块公共展示组件文件使用 `kebab-case.vue`，放在页面同级 `components/`；业务弹窗、抽屉和页面区块按业务模块放在 `sections/`；跨项目稳定复用组件放在 `src/components/`。
- 普通 TypeScript 模块使用 `kebab-case.ts` 或沿用既有短语义命名，例如 `rag-admin.ts`、`http.ts`、`routes.ts`。
- store 模块使用业务名命名，放在 `src/stores/modules/`，例如 `user.ts`。
- 类型命名使用业务语义后缀，例如 `RagSessionItem`、`RagMessageItem`；避免 `Data`、`Info`、`Obj` 等空泛名称。

## 单文件长度

- `.vue`、`.ts` 文件硬上限为 400 行。
- 超过 300 行时新增逻辑前先评估拆分。
- 超过 400 行必须拆分后再继续新增功能，除非只是临时迁移且交付说明中明确后续拆分计划。
- 拆分优先级：页面子组件、业务 API 类型、纯展示组件、局部工具函数、Pinia store。

## 错误处理

- API 错误统一优先在请求封装或业务 API 层处理。
- 页面可展示用户可理解的错误状态，但不要直接暴露后端敏感错误详情。
- 不吞掉关键错误；需要降级时保留可排查日志或状态。

## 环境变量

- 只读取 `VITE_` 前缀变量。
- 不在前端代码中写死后端 token、secret、数据库连接串或租户敏感配置。

## 工程化检查

- ESLint 使用 `apps/rag-admin/eslint.config.js`（ESLint 9 flat config），规则基线参考 `aplus-user-wms/eslint.config.js`。
- Prettier 使用 `apps/rag-admin/prettier.config.cjs`，不引入 `@aplus-frontend/prettier-config`。
- Stylelint 使用 `apps/rag-admin/stylelint.config.cjs`，规则参考 `@aplus-frontend/stylelint-config`，不引入该依赖包。
- 常用命令：`pnpm lint`、`pnpm lint:check`、`pnpm format`、`pnpm format:check`、`pnpm stylelint`、`pnpm stylelint:check`；根目录使用 `pnpm admin:*` 对应命令。
- 新增或修改代码后至少运行 `pnpm lint:check` 和 `pnpm format:check`；`pnpm lint` 会执行 `--fix`，`pnpm format` 会执行 `--write`。
- 首次接入时的既有 ESLint error 和 Prettier warning 需逐步清理，清理后保持命令 0 error。
