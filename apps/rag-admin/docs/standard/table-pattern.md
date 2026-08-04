# RAG Admin 列表表格统一方案

## 适用范围

本文档适用于列表页、带搜索表格页、多 Tab 列表页，以及以表格为主体的查询页面。具体开发执行由 `fd-page-dev` skill 的列表页分支承接。

## 标准骨架

列表页默认采用 `AgGrid + usePageListAgGrid` 模式。当前项目成熟参考为 `document-manager/index.vue` 和 `session-records/index.vue`，可参考其行为、组件用法和列配置；它们同时是 `page-structure-blueprint.md` 目录结构的示例。

新增复杂列表页按 `page-structure-blueprint.md` 落地，推荐文件组织：

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

- 搜索区枚举选项优先使用后端返回的 `_text` 或统一枚举配置。
- 日期范围字段在后端需要开始/结束字段时，显式转换参数，不依赖隐式命名猜测。
- 查询参数转换沿用 `src/api/rag-admin.ts` 中 `normalizeGridPageParams` 的口径；新 API 文件需要相同能力时，保持同一套参数清洗规则。

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
2. 项目已注册的自定义 valueType（如后续沉淀）。
3. `customRender` 或局部组件。

## 操作与权限

- 顶部按钮、行操作、批量操作、导出、日志、弹窗只在需求或参考实现明确需要时补齐。
- 列表页页面级顶部操作栏优先使用 `AgGrid` 的 `#title` 插槽和 `ApButton` / `Space` 组织。
- 操作列必须使用 `valueType: 'action'`，并通过 `fieldProps` 传递 `actions`。
- 当前项目暂无按钮级权限体系；若未来引入，遵循 `naming-conventions.md`。

## 多 Tab 与缓存

- 当前项目没有多标签页缓存链路，列表页依赖组件内局部状态，不额外引入缓存。
- 若未来新增多 Tab 列表页，遵循 `routing-and-state.md` 的状态管理口径，并明确每个 tab 的查询参数边界。

## 参考页样例

用户未指定参考页时，以下页面可作为成熟列表页行为参考：

- `src/views/document-manager/index.vue`：搜索 + 表格 + 分页 + 顶部操作 + 行操作 + 弹窗/抽屉。
- `src/views/session-records/index.vue`：列表 + 右侧详情卡片。

参考页均按 `page-structure-blueprint.md` 目录落地；新增页面同样遵循。

## 常见错误

- 周边页面已通过 columns 表达搜索区，却重新手写一套搜索表单。
- 跳过业务 API 封装，直接在页面内联请求。
- 手动映射枚举文案，忽略后端返回的 `_text`。
- 所有列都设置固定 width。
- 操作列手写按钮组，而不是使用 `valueType: 'action'`。
