# Proposal

## Why

React Admin 的知识问答与业务 Agent 共用一套会话列表、流式消息和输入交互，但实现仍位于 app 内，无法作为稳定的 React 公共能力复用。现有 Vue `ui-kit` 又不应承载 React 依赖，因此需要独立的 React UI Kit。

## What Changes

- 新增 workspace 源码包 `@aplus-sql/react-ui-kit`，基于 Ant Design X 提供会话列表、聊天框和完整会话工作区。
- 通过 adapter 注入业务 API、鉴权、历史消息转换和引用预览行为。
- 将 React Admin 的知识问答与业务 Agent 页面迁移到新包，并删除 app 内重复聊天组件。
- 补充包级测试、根命令、治理文档和浏览器回归。

## Capabilities

### New Capabilities

- `react-chat-ui-kit`：提供可复用的 React 会话列表、聊天框、工作区和 adapter 契约。
- `react-chat-page-migration`：知识问答与业务 Agent 使用公共 React UI Kit，保持现有业务行为。

### Modified Capabilities

无。

## Non-goals

- 不修改后端 API、鉴权、SSE 协议或数据库。
- 不迁移 Vue UI Kit、RAG Admin 或 `agent-chat-sdk`。
- 不生成独立发布产物，也不引入 Ant Design X SDK 或 X Markdown。

## Impact

影响 workspace 依赖、根命令、React Admin 两个聊天页面及其测试；不影响后端和 Vue 消费端。
