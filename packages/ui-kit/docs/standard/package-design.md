# UI Kit 包设计规范

本文规定 `packages/ui-kit` 中公共 Vue 组件和 hooks 的设计规则。

## 内容准入

- 必须有明确的跨项目复用目标，不能只因为单个页面文件较大就抽入 UI Kit。
- 职责和交互语义应稳定，不频繁跟随单个业务接口或页面流程变化。
- 必须能通过 props、emits、slots 或 options 与消费 app 协作，不依赖 app 内部模块。
- aplus-ui 已有成熟能力时优先组合使用，不新增同职责平行组件。

## 导出规则

- 组件从 `src/components/index.ts` 导出，hooks 从 `src/hooks/index.ts` 导出，根入口统一聚合公共能力。
- 公共组件、函数和类型使用稳定、可检索的业务无关名称。
- 不导出仅服务于单个组件的 helper；消费端不得依赖内部目录结构。
- 删除、重命名或改变公共签名前，必须搜索全部 workspace 消费者并同步迁移。

## 组件规则

- 组件只承担一个明确的展示或交互职责，不发起具体业务请求。
- 应用级行为必须显式注入；不存在可执行行为时，不渲染无效按钮或入口。
- props 和 emits 必须有 TypeScript 类型，复杂公共类型放在组件同级 `types.ts` 或 `interface.ts`。
- 样式使用局部 class，避免污染消费 app；需要全局覆盖第三方弹层时使用明确的包级 class 前缀。
- Less token 只能使用消费端技术基线中已存在的 aplus 变量，不在包内固定租户主题色。

## Hooks 规则

- composable 名称使用 `useXxx`，只能在 Vue setup/injection context 中使用时应显式校验或由 Vue 生命周期约束。
- hooks 不读取业务 store、cookie 或 `import.meta.env`，也不固化 route name、API URL 和业务 query。
- 外部副作用通过回调注入，并在组件卸载时清理 modal、监听器等资源。
- 返回对象保持职责清晰；新增返回字段前先确认所有消费者是否需要该公共能力。

## aplus-ui 与依赖规则

- 编写或修改 aplus-ui 组件代码前使用 `aplus info` 和 `aplus demo` 核对公开 API。
- 禁止引用 `@aplus-frontend/ui/es/src/*` 等内部路径。
- 运行时框架和 UI 依赖放入 peer dependencies，并在 dev dependencies 中提供包自身验证所需版本。
- 新增大型预览、编辑器或图表依赖前评估包体积和按需加载，不让无关消费者被迫打包。

## 测试与变更检查

- 组件测试覆盖 props/slots、可见状态、用户动作和注入回调；hooks 测试覆盖权限、导航、生命周期和失败分支。
- 文件预览等浏览器能力需要覆盖 Blob/File、格式判断、错误和销毁流程。
- 修改 exports、peer dependencies 或样式处理时必须运行消费 app 生产构建。
- 交付前运行 aplus usage/scan；`ApTable.Setting` 仅作为 AgGrid 官方列设置入口的已知例外。
