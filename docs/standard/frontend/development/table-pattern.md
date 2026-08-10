# 管理后台列表表格统一方案

## 适用范围

本文档适用于列表页、带搜索表格页、多 Tab 列表页，以及以表格为主体的查询页面。具体开发执行由页面开发 skill（如 `fd-page-dev`）的列表页分支承接。

## 强制规范

- 列表页的搜索栏与表格必须使用 AgGrid 系列组件（`AgGrid` + `usePageListAgGrid`），不允许使用 antdv `Table` 系列组件或类型（`Table`/`TableColumn`/`TableColumnGroup`/`TableSummary` 及对应 Props/ColumnsType 类型），不允许脱离 AgGrid 手写独立搜索表单。
- 搜索项一律通过列配置表达：`valueType` + `fieldProps`/`valueEnum` 生成查询表单项，`hideInSearch` 控制是否出现在搜索区，`hideInTable` 控制是否出现在表格。
- 内置查询表单只在 `request` 模式（不传 `dataSource`）下渲染；离线 `dataSource` 列表不支持内置搜索，需要搜索时改用 `request` 模式。
- 弹窗内的表格必须使用 `useAgGridModal` / `useAgGridSelectModal` 系列，禁止用 `ApModal` + antdv `Table` 手写弹窗表格。
- antdv Table 系列导入由 ESLint `no-restricted-imports` 拦截；模板内未导入直接写 `<Table>` 属运行时错误，由 code review 兜底。

## 标准骨架

列表页必须采用 `AgGrid + usePageListAgGrid` 模式。参考实现以应用内既有成熟列表页为准（搜索 + 表格 + 分页 + 顶部操作 + 行操作 + 弹窗/抽屉），可参考其行为、组件用法和列配置；它们同时是 `docs/standard/frontend/development/page-structure-blueprint.md` 目录结构的示例。

新增复杂列表页按 `docs/standard/frontend/development/page-structure-blueprint.md` 落地，推荐文件组织：

```text
src/views/<page>/
├── index.vue
├── hooks/
│   ├── use-columns.ts
│   └── use-actions.ts
├── components/
└── sections/
```

## 列定义原则

- 搜索项和表格列优先通过 columns/hooks 表达。
- 仅搜索区展示：`hideInTable: true`。
- 仅表格区展示：`hideInSearch: true`。
- 操作列使用 `valueType: 'action'` 和 `fieldProps.actions`。
- 长文本、弹窗预览、复杂状态展示应抽到 renderer 或局部组件，不在模板中堆内联逻辑。

## 搜索与参数

- 内置查询表单只在 `request` 模式（不传 `dataSource`）下渲染；离线 `dataSource` 列表不支持内置搜索，需要搜索时改用 `request` 模式。
- 搜索区枚举选项优先使用后端返回的 `_text` 或统一枚举配置。
- 日期范围字段在后端需要开始/结束字段时，显式转换参数，不依赖隐式命名猜测。
- 查询参数转换沿用 API 层统一的分页参数清洗口径；新 API 文件需要相同能力时，复用同一套清洗规则。

## 表格展示

- 明确设置稳定 `rowKey`。
- 至少保留一列 `minWidth` 或 `flex` 自适应宽度，避免所有列固定宽度造成布局僵硬。
- 固定宽度适用于序号、短编码、状态、操作等内容稳定的列。
- 枚举字段展示优先使用后端返回的 `_text`。
- 状态色、标签、警告提示优先使用 `ApTag`、`ApLabel` 等已有组件。
- `rowHeight`、`adaptive`、`wrapperStyle`、`browserTooltips` 等配置只在确有需要时添加。

## valueType 选型

选择顺序：

1. `@aplus-frontend/ui` 原生支持的 valueType。
2. 应用已注册的自定义 valueType。
3. `customRender` 或局部组件。

## 操作与权限

- 顶部按钮、行操作、批量操作、导出、日志、弹窗只在需求或参考实现明确需要时补齐。
- 列表页页面级顶部操作栏优先使用 `AgGrid` 的 `#title` 插槽和 `ApButton` / `Space` 组织。
- 操作列必须使用 `valueType: 'action'`，并通过 `fieldProps` 传递 `actions`。
- 按钮权限命名遵循 `docs/standard/frontend/development/naming-conventions.md`。

## 多 Tab 与缓存

- 列表页依赖组件内局部状态，不额外引入缓存。
- 多 Tab 列表页遵循所在应用架构文档的状态管理口径，并明确每个 tab 的查询参数边界。

## 参考页样例

参考实现以应用内既有成熟列表页行为为准（如搜索 + 表格 + 分页 + 顶部操作 + 行操作 + 弹窗/抽屉、列表 + 右侧详情卡片），均按 `docs/standard/frontend/development/page-structure-blueprint.md` 目录落地；新增页面同样遵循。

## 常见错误

- 使用 antdv `Table` 系列组件或 `TableColumnsType` 等类型（应改用 AgGrid，ESLint 会拦截导入）。
- 周边页面已通过 columns 表达搜索区，却重新手写一套搜索表单。
- 跳过业务 API 封装，直接在页面内联请求。
- 手动映射枚举文案，忽略后端返回的 `_text`。
- 所有列都设置固定 width。
- 操作列手写按钮组，而不是使用 `valueType: 'action'`。
