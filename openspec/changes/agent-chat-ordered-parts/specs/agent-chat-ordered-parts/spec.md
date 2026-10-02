## ADDED Requirements

### Requirement: Agent 流式内容按写入顺序分段
业务 Agent Chat SHALL 按后端写入 UI stream 的顺序输出可见 parts。文本在思考、工具调用或工具结果后恢复时 SHALL 使用新的 text id。

#### Scenario: 文本被工具过程打断
- **WHEN** Agent 输出正文、工具过程，再输出正文
- **THEN** 两段正文作为不同 text part 出现，工具过程位于二者之间

### Requirement: 新助手消息持久化有序 parts
系统 SHALL 为新的助手消息持久化按顺序排列的 reasoning、data-status 和 text parts，并继续保留 content 与 toolCalls。

#### Scenario: 加载新历史会话
- **WHEN** 用户加载包含 parts 的助手消息
- **THEN** API 返回原始 parts，页面按数组顺序展示所有可见过程

### Requirement: 旧历史保持兼容
系统 SHALL 对没有 parts 的历史消息保留现有 toolCalls 与正文回退展示，不伪造其原始顺序。

#### Scenario: 加载旧历史会话
- **WHEN** 助手消息没有 parts 字段
- **THEN** 页面继续展示已保存工具记录与正文
