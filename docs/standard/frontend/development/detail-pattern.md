# 管理后台详情页统一方案

## 适用范围

本文档适用于详情页、只读信息页、详情卡片页。具体开发执行由页面开发 skill（如 `fd-page-dev`）的详情页分支承接。

## 标准骨架

详情页默认采用 `ApCard + ApDescriptions` 模式，页面整体使用 `section.page` 骨架，页面标题与说明文案由布局通用样式（如 `.header-title` / `.header-subtitle`）展示。

详情统一通过应用级全局抽屉（URL query 驱动）展示：

- 页面不新建私有详情抽屉。
- 打开或切换详情通过全局抽屉 hook（如 `useLayoutDrawer`）修改 URL query；业务 id 统一使用约定 query 参数（如 `drawerCode`），由页面业务组件自行映射。
- 关闭通过全局抽屉 hook 移除 query 参数。

新增详情页按 `docs/standard/frontend/development/page-structure-blueprint.md` 落地，推荐文件职责：

- `index.vue`：页面布局、标题、状态、动作、权限、详情加载、区块组装。
- `schema.ts`：描述项字段 label、`valueType`、`span`、`visible`、时间 / 枚举 / 列表 / 附件等展示转换。
- `hooks/`：详情数据加载和刷新逻辑。
- `components/`：详情子区块、详情内表格、复杂只读展示。

推荐文件组织：

```text
src/views/<page>/
├── index.vue
├── schema.ts
├── hooks/
│   └── use-detail-loader.ts
└── components/
```

## 字段展示规则

- 后端已有 `_text` 字段时优先展示 `_text`，不要重复硬编码枚举文案。
- 时间展示沿用应用既有时间格式化工具或 dayjs 本地时区约定。
- 列表字段优先使用周边已有的 tag、label、tooltip 组件。
- 空值展示沿用 `ApDescriptions` 默认能力，不要在每个字段手写兜底。
- 条件展示使用 schema 的 `visible`，避免在模板里复制大量 `v-if` 描述项。
- 详情内表格优先作为独立子组件，不要把复杂表格列和详情头动作混在同一个 `index.vue`。

## 详情动作规则

- 编辑跳转必须保持路由参数与详情查询主键一致。
- 启停、作废、删除、取消等动作必须使用确认按钮或确认弹窗模式。
- 动作成功后按页面语义选择刷新详情、返回列表或关闭弹窗。
- 按钮权限命名遵循 `docs/standard/frontend/development/naming-conventions.md`。

## 参考页样例

参考实现以应用内既有只读展示能力为准（如只读抽屉内容 + 分页列表、列表 + 右侧详情卡片），新增详情页按蓝图目录落地。

## 常见错误

- 在 `index.vue` 模板中直接堆叠复杂字段转换，而非下沉到 schema 或子组件。
- 路由参数名称与列表跳转、详情接口不一致。
- 手动硬编码枚举文案，忽略后端返回的 `_text`。
- 详情内表格与详情头动作混在同一个 `index.vue` 中。
- 因为参考页存在某个动作就复制到新页面，而非按需求判断。
