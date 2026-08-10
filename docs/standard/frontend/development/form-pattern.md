# 管理后台表单页统一方案

## 适用范围

本文档适用于新增、编辑、详情、只读表单、带复杂字段区块的表单页面。具体开发执行由页面开发 skill（如 `fd-page-dev`）的表单页分支承接。

## 标准骨架

表单页默认采用 `ApForm + ApCard` 或 `ApModal` 表单模式。整页表单使用 `ApForm` 组织字段，弹窗表单使用 `ApModal` 承载。

新增表单页按 `docs/standard/frontend/development/page-structure-blueprint.md` 落地，推荐文件组织：

```text
src/views/<page>/
├── index.vue
├── hooks/
│   └── use-form-handler.ts
├── components/
│   └── xxx-form/
│       ├── index.vue
│       └── interface.ts
└── sections/
```

## 字段与区块

- 表单字段按 UI 区块组织，常规区块使用 `ApCard` 分组。
- label 宽度通过 `ApForm` 的 `labelCol` 统一设置，常见值为 `80px`、`100px`、`120px`、`130px`。
- 字段 `name` 必须与提交和回填数据结构一致。
- 复杂字段组、嵌套列表、联动逻辑应拆到局部组件或 hooks。
- 只读详情页优先复用同一字段结构，但要明确只读模式与编辑模式的差异。

## 新增与编辑复用

- 新增页和编辑页字段高度一致时，优先抽取共享表单组件。
- 共享表单组件通过 `mode`、`isEdit` 区分新增、编辑、只读。
- 若新增和编辑在字段、接口、联动、权限上差异较大，可以分开实现，但应保留一致的数据转换口径。

## 详情回填

- 编辑页必须加载详情数据后再回填表单。
- 回填前先处理接口结构与表单字段结构的差异。
- `setFieldsValue` 的字段名必须与 `ApForm` 字段 `name` 一致。
- loading、错误态和刷新入口应集中在页面或 hook 中，不散落在模板大函数内。

## 校验与提交

- 提交流程必须完整：校验 -> 数据转换 -> API 调用 -> 成功提示 -> 返回或关闭当前弹窗。
- 提交按钮、确定按钮需要 loading、成功提示和失败反馈。
- 校验失败时按 `ApForm` 校验结果定位到第一个错误字段，不静默失败或只提示不定位。
- 取消按钮遵循周边确认弹窗模式，避免用户误操作丢失输入。

## 权限与导航

- 登录守卫统一控制页面访问，页面不自行实现鉴权。
- 按钮操作权限命名遵循 `docs/standard/frontend/development/naming-conventions.md`。
- 提交成功后按页面语义关闭弹窗、返回列表或刷新详情。

## API 与数据

- 新增、编辑、详情接口优先复用应用 API 层已有 wrapper。
- 提交前只转换前后端字段差异，不做无关结构重排。
- 类型定义只覆盖当前页面实际使用的请求、响应、表单数据。

## 参考页样例

新增首个表单页时，按 `docs/standard/frontend/development/page-structure-blueprint.md` 的目录结构落地，并在落地后回填本文件的参考页样例。

## 常见错误

- 编辑页不加载详情数据就展示空表单。
- `setFieldsValue` 字段名与表单 `name` 不一致。
- 提交时不校验，或校验失败不定位错误字段。
- 新增和编辑重复实现大量相同表单逻辑。
- 提交成功后没有关闭弹窗、返回或刷新数据。
