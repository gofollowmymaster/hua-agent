# Design

## Context

React Admin 已有 adapter 驱动的 `ChatDemo`，负责会话分页、历史切换、AI SDK 流式会话、Markdown、reasoning、工具状态和引用预览。知识问答与业务 Agent 仅在 API、消息转换和展示文案上存在差异。当前 app 使用 React 18.3.1、antd 6.6.5、AI SDK 6 和 `@ai-sdk/react` 4。

## Goals / Non-Goals

**Goals:**

- 建立 React 专属 workspace 源码包，承接完整会话工作区。
- 使用 Ant Design X 原子组件统一会话、消息和输入体验。
- 保持严格消息顺序、旧 Agent 历史回退、引用预览和流式协议。
- 让业务 API、token、Umi model 和环境变量留在消费 app。

**Non-Goals:**

- 不统一两个后端会话接口。
- 不改变 Vue 聊天组件或 Web Component SDK。
- 不发布 npm 包或生成 `dist`。

## Decisions

### 独立 React 源码包

使用 `@aplus-sql/react-ui-kit`，通过 package exports 直接暴露 TypeScript/TSX 源码。React、React DOM、antd、Ant Design X、AI SDK 和 Markdown 依赖声明为 peer dependencies，并在 dev dependencies 中固定当前验证版本。

React Admin 的 Umi MFSU 配置继续排除 workspace 源码包，并将 `react` 与 `react-dom` 声明为 singleton shared dependencies，确保应用渲染器、Ant Design X 和 `@ai-sdk/react` 使用同一个 Hook dispatcher。

### 三层公共接口

`ConversationList` 与 `ChatBox` 是受控展示组件；`ChatWorkspace` 组合二者并管理会话加载、切换、新建、发送、停止、清空、错误和自动滚动。消费端默认使用 `ChatWorkspace`，仍可单独组合两个受控组件。

### Adapter 隔离业务

`ChatAdapter` 注入 transport、会话分页、历史加载、消息转换、状态/时间格式化和可选引用解析。包内不得导入 `apps/*`、Umi、业务 API、认证 storage 或环境变量。

### Ant Design X 映射

会话使用 `Conversations`，消息使用 `Bubble.List`，输入使用 `Sender`，空态使用 `Welcome`，reasoning 使用受控展开的 `Think`，工具状态使用 `ThoughtChain.Item`。所有 message parts 在单个气泡内按原始顺序映射，不合并或重排。

### 样式与主题

布局 class 使用 `react-ui-kit-` 前缀，自定义颜色通过 antd token 注入，不引用 React Admin 私有 CSS 变量，不覆盖全局 antd class。Ant Design X 自动继承消费端 ConfigProvider。

## Risks / Trade-offs

- [源码包依赖消费端构建配置] -> 用 React Admin 生产构建验证 TSX、CSS 和 tree shaking。
- [MFSU 将 workspace 包依赖编入独立 React 运行时] -> 将 React 与 React DOM 配置为 singleton，并用真实开发构建运行聊天 E2E。
- [Ant Design X DOM 变化影响测试] -> 测试只依赖公共 props、可访问文本和包级稳定 class/data 属性。
- [迁移打乱 Agent parts] -> 单元测试与 Playwright 同时固定 reasoning、状态和文本顺序。

## Migration Plan

1. 创建 React UI Kit、公共接口、测试和文档。
2. 迁移两个 adapter 类型与页面入口，删除 app 内聊天组件。
3. 更新 workspace 命令、依赖与治理入口。
4. 运行包级、React Admin、跨 workspace 和浏览器验证。

## Open Questions

无。
