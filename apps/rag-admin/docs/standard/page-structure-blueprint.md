# RAG Admin 页面结构蓝图

## 1. 适用范围

本文档定义 RAG Admin 页面统一目录标准。当前页面已按 `views/<page>/index.vue` 组织；页面私有组件放页面同级 `components/`，跨页面稳定复用组件放 `views/components/`。

本文档不负责顶层目录分层、历史兼容口径或 API 目录结构；这些内容由 `apps/rag-admin/AGENTS.md`、`module-design.md` 和 `api-client.md` 承接。

## 2. 单复杂页面推荐结构

新增单页复杂页面时，优先采用以下结构：

```text
src/views/<page>/
├── index.vue
├── hooks/
│   └── use-xxx.ts
├── components/
│   └── xxx/
│       ├── index.vue
│       └── interface.ts
└── sections/
    └── xxx/
        ├── index.vue
        ├── config.ts
        ├── use-xxx.ts
        └── interface.ts
```

职责说明：

- `index.vue`：页面编排与顶层组装。
- `hooks/`：页面私有逻辑。
- `components/`：页面私有组件。
- `sections/`：大区块拆分。

## 3. 标准 CRUD 模块推荐结构

同一模块存在多个标准页面动作时，优先采用以下结构：

```text
src/views/<Module>/
├── list/
│   └── index.vue
├── create/
│   └── index.vue
├── edit/
│   └── index.vue
├── detail/
│   └── index.vue
├── components/
│   └── <module-shared-name>/
│       ├── index.vue
│       └── interface.ts
├── helper/
│   ├── constants.ts
│   └── index.ts
└── interface.ts
```

职责说明：

- `interface.ts`：模块页面视图模型和页面适配类型入口，不替代 `src/api/` 的接口类型。
- `helper/`：模块内跨页面复用的方法与常量。
- `components/`：模块内跨页面复用组件。
- `list` / `create` / `edit` / `detail`：标准页面动作目录。

## 4. 跨页面复用边界

- 跨页面稳定复用组件继续放在 `src/views/components/`。
- 页面私有实现不得反向污染模块公共层或其他页面。
- 禁止页面之间直接引用彼此私有 `hooks/`、`components/` 或 `sections/`。
- API 类型和请求封装继续放在 `src/api/`，页面不自行创建 axios 实例。

## 5. 页面拆分决策

默认按以下顺序判断是否需要拆分：

1. 页面是否只是轻量场景，总代码量可控。
2. 是否已经出现页面私有复用逻辑。
3. 是否已经出现多个可独立理解的业务区块。
4. 是否需要为表格列、详情区块、表单区块单独承接逻辑。

可直接执行的判断句：

- 轻量页面可只保留 `index.vue`。
- 出现页面私有复用逻辑时，再新增 `hooks/`。
- 出现页面私有组件时，再新增 `components/`。
- 出现多个大区块时，再新增 `sections/`。

## 6. 命名规则

- 页面目录：`kebab-case`。
- 页面入口文件：`index.vue`。
- Hook：`use-*.ts` / `use-*.tsx`。
- 类型：`interface.ts`。
- 配置：`config.ts`。
- 列配置：`columns.tsx` / `use-columns.tsx`。
- 聚合导出：`index.ts`。
- 路由 path：`kebab-case`。
- 路由 name：`kebab-case` 或沿用同文件既有风格。

## 7. 页面迁移结果

- 存量扁平页面已迁移为 `views/<page>/index.vue` 目录结构。
- 页面私有组件已下沉到对应页面 `components/`，跨页面稳定复用组件保留在 `views/components/`。
- 文件、目录统一使用 `kebab-case`，不再创建扁平 `PascalCase.vue` 文件。

## 8. API 类型边界

- 请求、响应类型放在 `src/api/` 业务文件中。
- 页面视图模型、字段转换和临时适配类型可放在页面目录的 `interface.ts`、`hooks/` 或 `helper/`。
- 页面适配类型不得反向污染后端接口契约或 shared 类型。
