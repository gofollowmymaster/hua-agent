## ADDED Requirements

### Requirement: 聊天演示页面
`/business-agent/demo` SHALL 提供历史会话列表和流式聊天窗口。

#### Scenario: 新建会话并提问
- **WHEN** 用户新建会话并发送问题
- **THEN** Agent 流式回答并刷新历史会话

### Requirement: 历史会话切换
页面 SHALL 支持选择历史会话并加载消息。

#### Scenario: 选择历史会话
- **WHEN** 用户点击历史会话
- **THEN** 聊天窗口加载该会话消息
