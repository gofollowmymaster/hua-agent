# Proposal

## Why

Workspace 聊天链路同时存在 AI SDK 6、AI SDK 7 和不同主版本的 React/Vue hooks，实时消息经过多个 SDK 实例时缺少稳定的兼容保证。业务 Agent 已出现实时 reasoning 不展示、刷新历史后恢复的回归，需要统一运行时版本并补齐真实流测试。

## What Changes

- 将 TypeScript workspace 统一到 `ai@7.0.130`、`@ai-sdk/react@4.0.133` 和 `@ai-sdk/vue@4.0.130`。
- 保持 NestJS、FastAPI、Vue、React 和 Web Component 之间现有 AI SDK UI Message SSE 契约。
- 使用真实 transport/hook 测试覆盖实时 reasoning、状态、正文和错误事件。

## Capabilities

### New Capabilities

- `ai-sdk-7-workspace`：统一跨应用 AI SDK 运行时并保证实时聊天协议兼容。

### Modified Capabilities

无。

## Non-goals

- 不修改模型 provider、鉴权、业务 API、数据库或历史消息结构。
- 不在公共 UI Kit 内实现第二套 SSE 解析器。

## Impact

影响 NestJS API、RAG Admin、React Admin、Vue/React UI Kit、Agent Chat SDK 的依赖、类型与流式测试；Python API 仅增加协议消费验证，不修改生产代码。
