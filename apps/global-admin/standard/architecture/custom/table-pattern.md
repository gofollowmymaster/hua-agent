# Global Admin 列表表格统一方案

## 适用范围

本文档适用于 Global Admin 的列表页、详情抽屉内列表/执行日志、弹窗表格等所有以表格为主体的场景。

## 强制规范

- 搜索栏与表格必须使用 `@aplus-frontend/ui` 的 AgGrid 系列组件（`AgGrid` + `usePageListAgGrid`），禁止使用 antdv `Table` 系列组件或类型（`Table`/`TableColumn`/`TableColumnGroup`/`TableSummary` 及对应 Props/ColumnsType 类型）。
- 禁止脱离 AgGrid 手写独立搜索表单（如用 antdv `Input`/`Select` 拼筛选栏）；搜索项通过列配置表达，由 AgGrid 内置查询表单生成。
- 内置查询表单只在 `request` 模式（不传 `dataSource`）下渲染；离线 `dataSource` 模式不渲染搜索表单，需要搜索的列表必须使用 `request` 模式。
- 弹窗内表格必须使用 `useAgGridModal` / `useAgGridSelectModal` 系列，禁止用 `ApModal` + antdv `Table` 手写弹窗表格。
- antdv Table 系列导入由 ESLint `no-restricted-imports` 拦截；模板中未导入直接写 `<Table>` 属运行时错误，由 code review 兜底。

## 列定义原则

- 搜索项与表格列统一通过列配置表达：`valueType` + `fieldProps`/`valueEnum` 生成查询表单项，`hideInSearch` 控制是否出现在搜索区，`hideInTable` 控制是否出现在表格（仅搜索列）。
- 明确设置稳定 `rowKey`。
- 操作列使用 `valueType: 'action'` 和 `fieldProps.actions`。
- 状态等枚举展示优先 `ApTag` + `ThemeColor`，搜索枚举用 `valueEnum`。

## 两种数据模式

### 1. 离线模式（dataSource）

适用于数据量小、无需搜索、一次拉全量展示的场景。`dataSource` 绑定数据，`pagination: false` 时不分页。

- 该模式不渲染内置查询表单，如需搜索请改用 `request` 模式（见下节）。
- 参考实现：`src/views/tenants/index.vue`。

### 2. 服务端模式（request）

适用于服务端分页/搜索的场景，也是带搜索列表的默认模式。`request` 接收 `{ current, pageSize, ...params }`，返回 `{ data, total }`。

- 搜索项在列配置中声明：仅搜索列 `hideInTable: true`，仅展示列 `hideInSearch: true`，枚举用 `valueType: 'select'` + `valueEnum`；提交查询后参数随 `request` 传给后端。
- `:params` 变化会自动重新请求（含筛选控件驱动重载），查询表单参数与 `params` 会合并传给 `request`。
- 详情抽屉内的小型列表（如执行日志）同样使用该模式，配合 `pagination` 与服务端分页接口；抽屉内表格需给容器设置固定高度（如固定高度父容器 + `wrapper-style: { height: '100%' }`），避免 AgGrid 高度塌陷。
- 参考实现：`src/views/schedules/index.vue`（全量 + 服务端 keyword/status 搜索，不分页）、`src/views/schedules/sections/schedule-detail/index.vue`（服务端分页）。

## 常见错误

- 手写 `Input`/`Select` 筛选栏，而不是用 AgGrid 内置查询表单。
- 使用 antdv `Table` 或 `TableColumnsType`（ESLint 会拦截报错）。
- 用离线 `dataSource` 模式却期望内置搜索表单渲染（应改用 `request` 模式）。
- 详情抽屉里表格不设置高度导致 AgGrid 高度塌陷。
