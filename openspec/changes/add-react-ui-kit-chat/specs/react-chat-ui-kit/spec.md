# Spec Delta

## ADDED Requirements

### Requirement: React 公共聊天组件

workspace SHALL 提供 `@aplus-sql/react-ui-kit`，导出受控的会话列表、聊天框、完整会话工作区及其公共类型。

#### Scenario: 导入公共能力
- **WHEN** React 应用从包根入口导入聊天能力
- **THEN** 应用可以组合 `ConversationList`、`ChatBox`，或直接使用 `ChatWorkspace`

### Requirement: Adapter 隔离业务依赖

公共包 SHALL 通过 `ChatAdapter` 注入 transport、会话与消息行为，不得读取业务 API、认证状态、Umi model、路由或环境变量。

#### Scenario: 两个业务后端
- **WHEN** 知识问答和业务 Agent 分别提供 adapter
- **THEN** 同一个 `ChatWorkspace` 可以加载历史并完成流式聊天

### Requirement: Ant Design X 会话体验

公共包 SHALL 使用 Ant Design X 的 Conversations、Bubble、Sender、Welcome、Think 和 ThoughtChain 提供会话与聊天交互。

#### Scenario: 完整会话流程
- **WHEN** 用户加载、切换、新建、发送、停止或清空会话
- **THEN** 工作区展示一致的加载、选中、流式、错误和空状态

### Requirement: 保持消息原始顺序

聊天框 SHALL 按 `message.parts` 原始顺序展示 reasoning、data-status 和 text，且 reasoning 内容保持可见。

#### Scenario: Agent 有序事件
- **WHEN** 助手消息包含交错的 reasoning、工具状态和文本
- **THEN** 所有内容严格按输入顺序渲染，工具结果保留入参与输出
