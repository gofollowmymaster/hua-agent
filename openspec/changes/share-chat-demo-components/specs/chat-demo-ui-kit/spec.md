## ADDED Requirements

### Requirement: 提供共享聊天组件和 hook
UI Kit SHALL 通过 `@aplus-sql/ui-kit/chat-demo` 导出 `ChatDemoShell`、`useChatDemo` 和公共类型。

#### Scenario: 导入共享组件
- **WHEN** 消费应用导入 `@aplus-sql/ui-kit/chat-demo`
- **THEN** 获取共享聊天组件、hook 和类型

### Requirement: 通过 adapter 隔离后端
共享组件 SHALL 通过 `ChatDemoAdapter` 注入会话、消息和发送行为，不读取业务 API 或 store。

#### Scenario: 两个不同后端适配
- **WHEN** 知识问答和业务 Agent 分别提供 adapter
- **THEN** 共享组件无需修改即可渲染两种 Demo
