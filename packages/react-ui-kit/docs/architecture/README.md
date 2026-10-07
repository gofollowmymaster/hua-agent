# React UI Kit 架构

`@aplus-sql/react-ui-kit` 是 React 18 + antd 6 + Ant Design X 的 workspace 源码包。它只承担与业务域无关的会话交互，不拥有 API、认证、路由或持久化。

数据流为：

```text
consumer page -> ChatWorkspace -> ChatAdapter -> consumer API/transport
                         |-> ConversationList
                         `-> ChatBox -> Ant Design X
```

`ConversationList` 和 `ChatBox` 是受控组件；`ChatWorkspace` 管理会话分页、历史切换、本地会话 ID、AI SDK 流式状态、新建、发送、停止和清空。业务差异通过 `ChatAdapter` 与展示配置注入。

包通过根 exports 暴露公共能力，消费端不得依赖 `src/*` 深路径。CSS 使用 `react-ui-kit-` 前缀，仅定义布局；颜色与组件视觉来自消费端 Ant Design ConfigProvider。
