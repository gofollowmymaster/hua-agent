# 管理后台页面结构蓝图

## 1. 适用范围

本文档定义管理后台页面统一目录标准。页面按 `views/<page>/index.vue` 组织；模块内公共组件放 `components/`，业务弹窗、抽屉和页面区块放 `sections/`，应用内跨页面稳定复用组件放 `src/components/`。

本文档不负责顶层目录分层、历史兼容口径或 API 目录结构；这些内容由 `docs/standard/frontend/development/directory-structure.md`、应用级 `AGENTS.md` 与所在应用架构文档（如 `apps/*/standard/architecture/custom/auth-and-api-client.md`）承接。

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
- `components/`：当前模块中 sections 或多个页面复用的公共展示组件。
- `sections/`：页面业务模块，包含页面区块、业务弹窗、业务抽屉；多页面共用的业务模块也放这里。

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
├── sections/
│   └── <business-section>/
│       ├── index.vue
│       ├── components/
│       └── hooks/
├── helper/
│   ├── constants.ts
│   └── index.ts
└── interface.ts
```

职责说明：

- `interface.ts`：模块页面视图模型和页面适配类型入口，不替代应用 API 层的接口类型。
- `helper/`：模块内跨页面复用的方法与常量。
- `components/`：模块内 sections 或多个页面复用的公共展示组件。
- `sections/`：页面业务模块，包含页面区块、业务弹窗、业务抽屉；多页面共用的业务模块也放这里。
- `list` / `create` / `edit` / `detail`：标准页面动作目录。

## 4. 跨页面复用边界

- 模块内被多个 section 或页面复用的公共展示组件放在模块 `components/`。
- 业务弹窗、抽屉和页面区块按业务模块放在 `sections/`；多页面共用的业务模块也放这里。
- 应用内跨页面稳定复用组件放在 `src/components/`。
- 页面私有实现不得反向污染模块公共层或其他页面。
- 禁止页面之间直接引用彼此私有 `hooks/`、`components/` 或 `sections/`。
- API 类型和请求封装继续放在应用 API 层（如 `src/api/`），页面不自行创建 axios 实例。

## 5. 页面拆分决策

默认按以下顺序判断是否需要拆分：

1. 页面是否只是轻量场景，总代码量可控。
2. 是否已经出现页面私有复用逻辑。
3. 是否已经出现多个可独立理解的业务区块。
4. 是否需要为表格列、详情区块、表单区块单独承接逻辑。

可直接执行的判断句：

- 轻量页面可只保留 `index.vue`。
- 出现页面私有复用逻辑时，再新增 `hooks/`。
- 出现被多个 section 或页面复用的展示组件时，再新增 `components/`。
- 出现业务弹窗、抽屉或独立业务区块时，再新增 `sections/`。

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

## 7. 结构收敛要求

- 存量扁平页面逐步迁移为 `views/<page>/index.vue` 目录结构。
- 业务弹窗、抽屉和页面区块按业务模块放入 `sections/`；模块公共展示组件保留在 `components/`，应用内跨页面稳定复用组件保留在 `src/components/`。
- 文件、目录统一使用 `kebab-case`，不再创建扁平 `PascalCase.vue` 文件。

## 8. API 类型边界

- 请求、响应类型放在应用 API 层（如 `src/api/`）业务文件中。
- 页面视图模型、字段转换和临时适配类型可放在页面目录的 `interface.ts`、`hooks/` 或 `helper/`。
- 页面适配类型不得反向污染后端接口契约或 shared 类型。
