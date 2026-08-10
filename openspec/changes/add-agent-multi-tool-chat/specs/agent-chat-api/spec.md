## ADDED Requirements

### Requirement: 提供 AGUI 流式聊天
系统 SHALL 提供 `POST /agent/chat`，接收 AGUI 消息并流式返回状态、工具调用阶段和最终答案。

#### Scenario: 发送问题
- **WHEN** 用户发送业务知识问题
- **THEN** Agent 调用工具并流式返回答案

### Requirement: 提供会话分页
系统 SHALL 提供 `POST /agent/chat/sessions/page`，按租户分页返回会话及最近消息。

#### Scenario: 查询历史会话
- **WHEN** 请求会话分页
- **THEN** 返回当前租户会话列表

### Requirement: 提供消息查询
系统 SHALL 提供 `GET /agent/chat/sessions/:id/messages`，返回会话内消息。

#### Scenario: 查询消息
- **WHEN** 请求指定会话消息
- **THEN** 返回按时间排序的消息
