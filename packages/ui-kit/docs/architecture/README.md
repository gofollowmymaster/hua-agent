# UI Kit 架构说明

`packages/ui-kit` 是 monorepo 内 Vue 3/Vite 前端项目共享的 UI 源码包，承载基于 aplus-ui 的稳定组件、composable 和配套公共类型。实现规范见 `packages/ui-kit/docs/standard/README.md`。

## 当前状态

- 包名：`@aplus-sql/ui-kit`。
- 目录：`packages/ui-kit`。
- 根入口：`packages/ui-kit/src/index.ts`。
- 子路径入口：`@aplus-sql/ui-kit/components`、`@aplus-sql/ui-kit/hooks`。
- 当前消费者：`apps/rag-admin`。
- 当前通过 package exports 直接暴露 TypeScript/Vue 源码，不生成独立 `dist`。

## 运行边界

- Vue、Vue Router、aplus-ui、Open File Viewer 和 pdfjs 由消费端提供兼容 peer dependencies。
- `.vue` 和 Less 样式由消费端 Vite 构建链处理，消费端需要提供兼容的 aplus Less token。
- 组件和 hooks 只能通过 props、emits、slots 或 options 接收应用行为，不得反向依赖 `apps/*` 源码。

## 阅读入口

- `package-boundary.md`：UI Kit 内容准入、应用隔离、依赖和样式边界。

修改 UI Kit 时必须同时检查所有消费 app，并按交互影响补充组件测试和消费端构建验证。
