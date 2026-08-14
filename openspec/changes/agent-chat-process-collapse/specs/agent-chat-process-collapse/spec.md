## ADDED Requirements

### Requirement: 后端区分过程与最终结果
业务 Agent Chat SHALL 通过 AGUI 协议区分过程信息与最终结果：模型推理文本使用 `reasoning-start/delta/end`，工具结束状态使用 `data-status`，最终答案继续使用 `text`。

#### Scenario: 推理文本
- **WHEN** 模型流式返回 `reasoning_content` 或 `reasoning` 内容块
- **THEN** 系统将其作为过程信息增量输出，不写入最终答案

#### Scenario: 工具结果摘要
- **WHEN** `search_knowledge` / `get_document` / `get_document_chunks` 执行结束
- **THEN** 系统输出包含文档名或切片数的状态摘要，并携带完整入参与输出

### Requirement: 消息按原始顺序展示且不折叠
聊天界面 SHALL 按 `message.parts` 的原始顺序渲染 `reasoning`、`data-status` 和 `text`，所有输出保持展开。

#### Scenario: 流式消息
- **WHEN** 助手消息包含推理、工具状态和最终答案
- **THEN** 三类内容按到达顺序依次展示，不分组也不折叠

#### Scenario: 多种 stage
- **WHEN** `data-status` 包含任意 stage
- **THEN** 页面统一渲染为状态卡；`tool_result` 额外内联展示工具入参与输出

### Requirement: 历史会话展示工具过程
历史会话消息加载 SHALL 从已持久化的 `toolCalls` 恢复工具状态、入参与输出，并按顺序展示。

#### Scenario: 切换历史会话
- **WHEN** 用户打开历史会话
- **THEN** 页面按原始顺序展示工具状态、入参与输出和最终答案
