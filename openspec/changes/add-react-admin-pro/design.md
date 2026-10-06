# Design

## Context

现有 `apps/rag-admin` 使用 Vue 3、Vite、Pinia 和 Vue 专属 UI 包，后端通过 Nest `ServeStaticModule` 发布 `apps/api/public`。`@aplus-sql/http-client` 与框架无关，但 `@aplus-sql/ui-kit`、聊天 UI 和文件预览包装均依赖 Vue。React Admin 必须并行发布、复用现有 HTTP/流式协议，并避免改造稳定的 Vue app。

## Goals / Non-Goals

**Goals:**

- 建立独立、可构建、可测试的 Umi Max React app。
- 在 React 组件体系中复现当前可见业务行为和兼容逻辑。
- 共享无框架依赖的 HTTP client，保持后端零改动。
- 让两套后台能独立启动、发布、验收和回滚。

**Non-Goals:**

- 不抽象跨 Vue/React 的 UI 组件层。
- 不切换默认生产入口，不实现当前占位模块。
- 不修改 API DTO、数据库或租户鉴权。

## Decisions

### 1. Umi Max 与兼容版本组合

采用 Umi Max 4.7.22、React 18.3.1、antd 5.29.3、ProComponents 2.8.10。ProComponents 当前 peer range 未声明支持 antd 6，因此不使用最新 antd 6。路由使用 hash history，`publicPath` 为 `/public/react-admin/`，构建输出到 `apps/api/public/react-admin`。

### 2. 应用内认证 model 与共享 HTTP client

React app 使用 Umi model 管理认证状态，并由纯 TypeScript storage 模块读写与 Pinia 相同的 `authToken` JSON 结构。API 层继续使用 `@aplus-sql/http-client`；流式 fetch 单独注入 Authorization 与 401 回调。相较抽取跨框架认证包，此方案影响面更小且不改变 Vue app。

### 3. React 页面独立实现

列表使用 ProTable，表单使用 ProForm，布局使用 ProLayout，弹窗/抽屉/上传使用 antd。API wrapper 和页面类型保留在 React app，按当前 Vue API 文件边界组织，不将仍在演进的业务契约提升到 `packages/shared`。

### 4. URL 驱动的全局抽屉

布局读取 `drawer` 和 `drawerCode` query，根据允许列表渲染三类详情内容；打开与关闭只修改相关 query。这样保留刷新、复制链接和新标签恢复能力，并避免页面私有抽屉状态分叉。

### 5. React 聊天适配层

使用 `@ai-sdk/react` 与 `ai` 的 `DefaultChatTransport` 复用原流协议。共享 React `ChatDemo` 只依赖 adapter；知识问答 adapter 映射纯文本历史并拦截引用链接，业务 Agent adapter 优先映射有序 `parts`，无效或缺失时执行现有 legacy 回退。

### 6. 框架无关预览 core

不引入另一套 React 文件预览器。React wrapper 在 effect 中调用 `@open-file-viewer/core.createViewer`，注册 image、pdf、office、text plugin，并在文件变化和卸载时调用 `destroy`、撤销临时 URL。

### 7. 验证分层

Vitest 与 React Testing Library 验证纯逻辑和组件交互；Playwright 通过 mock API 覆盖关键页面流程和响应式布局。构建验证同时覆盖新 React app、现有 Vue app、HTTP client 和根 workspace。

### 8. 集中的石墨青绿主题

React Admin 在 `src/theme/` 集中维护 Ant Design token、ProLayout token、业务 CSS 变量与聊天状态色映射。A/C/D 租户共用石墨中性色和青绿色强调，仅保留名称与字母标识差异；页面不得引入脱离主题预设的临时颜色。主题 CSS 变量同时安装到文档根节点，保证挂载到 `body` 的菜单、弹窗等 portal 浮层仍可使用主题颜色。页面结构、12px 页面边距和业务交互不随主题变化。

### 9. ProLayout 暗色区域与浅色内容隔离

顶栏和侧栏只通过 ProLayout token 使用石墨深色，不启用会向内容区后代注入暗色算法的 `realDark` 导航主题。Dropdown 与 Breadcrumb 显式使用浅色内容区 token，Header 清除默认分割边框和阴影；危险按钮单独关闭阴影，主按钮阴影保持不变。这样折叠菜单 portal 继续维持深色，同时表格工具浮层、面包屑和危险操作在浅色内容区保持可读。

### 10. 登录后工作台中度紧凑

登录后的 ProLayout 内使用独立 ConfigProvider 密度配置，将默认控件收紧到 30px、Header 收紧到 48px、展开侧栏收紧到 200px，并通过 Card、Form、Menu、Table、Tabs、Pagination、Modal 和 Drawer 官方 token 统一容器与控件间距。登录页保留原大号表单尺寸；聊天等自定义布局只在自身 CSS 中收紧网格和留白，不启用全局 compactAlgorithm，也不缩小文档预览画布。

ProTable 默认使用组件库 `small` 密度，单元格使用 `6px 8px` 内边距，搜索区与表格 Card 使用 12px 内边距，分页使用小号尺寸。密度菜单继续保留，用户可在当前页面临时切换为中等或宽松；重新进入页面时恢复小号默认值。

全应用使用 12px 正文基准，并显式将小号字号下限保持在 12px，避免 Tag、分页和辅助文案被算法缩小到 10px。登录页与工作台共用该规则；页面标题、弹窗标题和品牌名称继续使用组件库派生的大号与标题字号保留信息层级，控件高度和页面间距不随字号变化。

## Risks / Trade-offs

- [两套前端业务类型可能漂移] -> API 文件按 Vue 当前边界镜像，并用 adapter/页面测试锁定路径和字段。
- [同源 `authToken` 被任一后台清除] -> 这是保持单点登录与 401 一致性的预期行为，并通过兼容测试固定格式。
- [Umi 与 workspace ESLint 版本差异] -> app 使用独立 flat ESLint 配置和根 catalog 版本，构建不依赖 Umi 内置 lint。
- [文件预览资源泄漏] -> 将 viewer、Blob URL 生命周期集中在单一 hook 并添加卸载测试。
- [无本地真实账号时无法端到端验证] -> Playwright 使用 mock API 完成确定性验收，并把真实后端冒烟结果单独记录。

## Migration Plan

1. 并行构建并发布 `/public/react-admin/`，保留 `/public/rag-admin/`。
2. 使用 mock E2E 和可用环境账号验收 React Admin。
3. 发生问题时停止发布或删除 React 静态目录即可回滚，Vue Admin 和后端无需变更。
