## ADDED Requirements

### Requirement: 后端区分过程与最终结果
业务 Agent Chat SHALL 通过 AGUI 协议区分过程信息与最终结果：模型推理文本使用 `reasoning-start/delta/end`，工具结束状态使用 `data-status`，最终答案继续使用 `text`。

#### Scenario: 推理文本
- **WHEN** 模型流式返回 `reasoning_content` 或 `reasoning` 内容块
- **THEN** 系统将其作为过程信息增量输出，不写入最终答案

#### Scenario: 工具结果摘要
- **WHEN** `search_knowledge` / `get_document` / `get_document_chunks` 执行结束
- **THEN** 系统输出包含文档名或切片数的状态摘要

### Requirement: 过程信息可折叠
业务 Agent 聊天界面 SHALL 在最终 `text` part 开始输出后收起过程信息，并保留可点击展开入口。

#### Scenario: 最终答案开始输出
- **WHEN** 助手消息出现首个 `text` part
- **THEN** 过程信息自动收起，最终答案正常展示

#### Scenario: 再次展开
- **WHEN** 用户点击“过程信息”
- **THEN** 可再次查看工具调用、检索摘要和推理文本

### Requirement: 历史会话只保留最终结果
历史会话消息查询 SHALL 不返回过程轨迹，切换历史会话后只展示最终答案。

#### Scenario: 切换历史会话
- **WHEN** 用户打开历史会话
- **THEN** 页面只渲染已持久化的最终答案
