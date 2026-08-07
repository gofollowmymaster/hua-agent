# UI Kit 包边界

本文记录 `packages/ui-kit` 的架构边界。

## 适合放入 UI Kit 的内容

- 已有明确跨项目复用场景、职责稳定的 Vue 组件。
- 与具体业务域无关，通过参数注入行为的 composable。
- 组件 props、emits、slots、options 和返回值对应的公共类型。
- 组件内部需要的纯展示工具、文件格式转换和局部样式。
- 基于 aplus-ui 的稳定交互封装，例如表格操作栏、文件预览入口。

## 不适合放入 UI Kit 的内容

- 页面入口、业务 section、单个页面私有组件或一次性 composable。
- 业务 API、DTO、Pinia store、登录 SDK、cookie、租户或权限数据源。
- 消费 app 的路由表、路由名称、环境变量、主题配置或持久化 key 前缀。
- 后端契约、Prisma model、Node 服务端代码或跨端公共类型。
- 绕过公开 API 的 aplus-ui 深路径依赖；已核对的 `ApTable.Setting` 官方 AgGrid 用法除外。

## 应用隔离

- 包内禁止导入 `apps/*` 或使用消费 app 的 `@/*` 路径别名。
- 文件加载、刷新、权限判断、导航目标和 persistence key 必须由消费端显式传入。
- 组件不得自行创建业务请求 client，也不得直接读取全局 store 或登录状态。
- composable 可以依赖 Vue Router 的公开 API，但不得固化具体 route name、path 或 query 业务语义。

## 导出与源码包边界

- 公共能力必须从根入口或声明的 `components`、`hooks` 子路径导出。
- 消费端不得引用 `@aplus-sql/ui-kit/src/*` 或其他包内实现路径。
- 未导出的组件、helper 和类型均视为内部实现，可以在包内重构。
- CSS 和 Less 被标记为 side effects；未使用的 Vue 组件必须保持可 tree-shake。

## 当前约束

UI Kit 只服务于同 workspace、兼容 Vue 3/Vite/aplus-ui 技术基线的前端项目。独立仓库发布、跨框架组件和 npm 版本发布不属于当前边界。
