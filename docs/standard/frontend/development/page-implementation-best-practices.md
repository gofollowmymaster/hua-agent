# 管理后台页面开发最佳实践

生成或重构页面、组件、sections、hooks、utils 和页面常用方法时，默认遵守本文档的推荐实践。

本文档负责“怎么写更稳”的推荐口径，包括组件 API 使用、props 配置、hook 使用、utils 使用、页面常用方法和常见组合写法。必须使用某个公共能力的强制规则见 `docs/standard/frontend/development/table-pattern.md`、`form-pattern.md`、`detail-pattern.md` 中对应页面类型的强约定表格。

## 组件选型

- 优先使用应用既有全局组件和 `@aplus-frontend/ui` 组件，避免使用原生 HTML 或 `@aplus-frontend/antdv` 组件重复实现已有业务能力。
- 使用 `@aplus-frontend/ui` 前必须按 `aplus-ui` skill 查询组件 API / demo，不凭记忆猜 props。
- 可复用业务能力优先沉淀到 `src/components/` 或模块 `components/`，页面私有展示区块放到页面 `sections/`。

## Hooks 与 utils

- 页面内状态、请求、弹框、表格列、数据转换等逻辑应优先使用当前仓库已有 hooks / utils 或页面同级 hooks 承接，避免在 `index.vue` 中堆叠大段流程逻辑。
- 需要新增 hook、utils、adapter、常量或类型时，先按 `docs/standard/frontend/development/page-development.md` 的复用边界判断放在页面私有、模块公共还是跨页面公共目录。

## 表单项

- 表单字段默认使用 `ApFormItemText`、`ApFormItemSelect`、`ApFormItemNumber`、`ApFormItemDate` 等 `ApFormItemXXXX` 系列表单项组件。
- 仅当内置表单项无法满足自定义渲染时，才使用 `ApForm.FormItem` 包裹自定义控件。
- 多选下拉框默认在 `field` 中添加 `maxTagCount: 'responsive'`，避免选中项过多时撑开表单宽度或遮挡相邻内容。
- 文件、附件、图片等上传字段默认使用 `ApUpload` 组件，并按需求选择单文件或 `multipleFile` 类型。
- 表单 label 宽度默认通过 `ApForm` 的 `labelCol` 属性统一设置，避免在每个表单项上重复设置。
- 表单项默认不设置 `bordered` 和 `placeholder` 属性。
- 表单校验 `required` 的默认提示信息统一为 `不可为空`，除非业务明确要求更具体的提示文案。

## AgGrid 系列组件

- 当表格中包含表单项、可编辑单元格或单元格校验时，优先使用 `EditableAgGrid` / `EditableAgGridFormItem`，不在普通 `AgGrid` 的 `customRender` 中直接嵌入表单项。
- 列表页默认使用 `usePageListAgGrid`，并复用 API 层已有的查询参数转换口径（如统一的分页参数清洗函数），新 API 文件保持同一套清洗规则。
- 日期范围查询项必须按接口字段显式拆分配置；当接口要求 `xxxStart`、`xxxEnd` 等字段时，在查询参数转换中传入映射配置，禁止只提交单个 UI 字段数组。
- 当 `ApCard` 与 AgGrid 系列组件组合使用时，通过 `wrapperStyle` 将表格外层 padding 设置为 `0`，避免卡片内容区与表格组件自身间距叠加。
- `rowHeight` 应使用稳定值或应用后续沉淀的公共常量，不直接散落魔法数字。

## AgGrid 列配置

适用于 `AgGrid` / `EditableAgGrid` / `EditableAgGridFormItem` 这三个组件。

- `AgGrid` 的列配置默认会作用于查询表单和表格两端；如果某个列只用于表格展示，且需求未明确说明需要作为查询条件，必须设置 `hideInSearch: true`。
- 使用 AgGrid 系列列配置时，至少保留 1~2 列设置 `minWidth` 或 `flex`，用于支撑表格横向空间和列宽自适应。
- 操作列必须使用 `valueType: 'action'`，并通过 `fieldProps` 传递 `actions` 参数，禁止使用 `customRender` 手写按钮组。

示例：

```ts
{
  title: '操作',
  key: 'action',
  valueType: 'action',
  fixed: 'right',
  hideInSearch: true,
  fieldProps: ({ record }) => ({
    actions: [
      {
        text: '详情',
        onClick() {
          goDetail(record);
        },
      },
      {
        text: '删除',
        color: 'error',
        async onAction() {
          await deleteRecord(record);
        },
      },
    ],
  }),
}
```

## 状态文本

- 表格或详情中展示状态文本时，优先使用 `ApLabel` / `ApStatus`；当状态需要展示取消原因、失败原因、驳回原因等补充说明时，优先通过 `ApLabel` 的 `helpMessage` 传入。
- 字段带有气泡提示 icon 时，展示宽度会比普通字段多约 `20px`；设置表格列宽、描述列表 label 宽度或表单 label 宽度时，需要预留提示 icon 宽度。

## 弹框

- 每个弹窗必须拆分为独立的内容组件和调用门面 hook，不在页面 `index.vue` 中内联弹窗结构。
- 优先使用 `ApModal.createModal` 或 `ApModal.createModalStream`；简单确认、提示类弹窗可使用 `ApModal.*` 静态方法。
- 内容组件和调用门面 hook 放在同一个文件夹下组织：

```text
views/<page>/sections/<modal-name>/
├── index.vue            # 弹窗内容组件，不包含弹窗外壳
└── use-<modal-name>.ts  # 调用门面 hook，负责 createModal 参数和打开/销毁
```

- 同一模块内多页面共用的业务弹窗仍放模块 `sections/`；应用内跨页面稳定复用的弹窗使用相同结构，放在应用公共组件目录（如 `src/components/<modal-name>/`）。
- `ApModal.createModal` 的 `content` 必须直接传入 `h(ContentComponent, props)` VNode，不要传函数，避免内容渲染异常。
- 普通确认、提示、表单、内容展示等弹框优先使用 `ApModal`，避免直接使用 `@aplus-frontend/antdv` 的 `Modal` 或手写弹框结构。
- 所有详情统一通过应用级全局抽屉（URL query 驱动）展示；页面通过全局抽屉 hook 打开或切换、关闭，不再维护页面私有抽屉。
- 表格弹框使用 `useAgGridModal`，表格选择弹框使用 `useAgGridSelectModal`，避免用 `ApModal` + `AgGrid` 手写重复的弹框表格能力。
- 表格选择弹框默认宽度设置为 `1200`，除非业务场景明确需要更窄或更宽的弹框。

## 时间字段

- 时间展示默认使用 `dayjs` 和应用既有格式化函数（如 `formatTime`）的本地时区口径。
- 后端返回时间戳或字符串未明确时区时，先按接口文档和后端实现确认；默认按应用约定时区（如 `Asia/Shanghai`）展示，不沿用其他业务线的默认时区。

## 描述列表

- `ApDescriptions` 需要统一设置 label 宽度，使用 CSS 变量 `--ap-descriptions-item-label-width` 控制。
- 同一页面存在多个 `ApDescriptions` 时，优先抽取共享样式对象或外层容器变量。
- `ApDescriptions` 默认使用 `bordered: false`、`column: 3`，不需要显式声明。
- 描述列表时间字段使用 dayjs 标准格式（如 `YYYY-MM-DD HH:mm:ss`、`YYYY-MM-DD`）和 `zoneAlias`，禁止将 AgGrid 内置格式直接用于 `ApDescriptions`。

## 按钮

- 所有按钮使用 `ApButton`，并设置 `min-width` 属性。
- 确认、提交、完成等主动作使用 `type="primary"`；普通动作默认不加 icon。
- 危险操作需要二次确认或明确反馈；有副作用的操作成功后，需要刷新受影响的数据视图。

## 反馈

- 用户触发的成功、失败、删除、状态变更等操作应给出明确反馈。
- 异步操作需要避免静默失败，必要时使用 loading、禁用态或确认弹窗降低重复提交风险。

## 导航

- 页面跳转使用 Vue Router 的 `router.push({ name })`，优先使用路由 `name`，避免散落字符串 path。
- 关闭弹窗、抽屉或返回上一页时，遵循组件既有模式和路由语义。

## 常见错误

- 在页面中内联 axios 请求或手动拼接 URL。
- 搜索项和展示列共用列配置时忘记 `hideInSearch` / `hideInTable`。
- 操作列用 `customRender` 手写按钮组，而不是 `valueType: 'action'`。
- 所有列都固定 width，没有自适应列。
- 弹框手写重复的表格选择能力，而不是使用 `useAgGridModal` / `useAgGridSelectModal`。
- 多个 `ApDescriptions` 各自散落不同 label 宽度。
