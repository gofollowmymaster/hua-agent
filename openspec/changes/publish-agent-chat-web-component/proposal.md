## Why

业务 Agent Chat 目前只在 RAG Admin 内部使用，需要对外提供可安装的 npm 能力，让外部应用快速接入，同时不允许公开包依赖公司内部 `@aplus-frontend/ui`。

## What Changes

- 移除 `chat-demo` 共享组件对 `@aplus-frontend/ui` 的依赖。
- 新建公开 npm Web Component SDK `aplus-agent-chat`（工作名）。
- 后端 Agent Chat 支持 JWT 和固定 Secret 两种鉴权。

## Capabilities

### New Capabilities

- `agent-chat-web-component`: 提供框架无关的 `<aplus-agent-chat>` Web Component。
- `agent-chat-external-auth`: Agent Chat 接口支持 JWT 和 Secret 外部鉴权。

### Modified Capabilities

- `chat-demo-ui-kit`: 移除对 aplus-ui 的依赖，样式改为独立 CSS 变量。

## Impact

- 影响 `packages/ui-kit/src/chat-demo` 和样式。
- 新增 `packages/agent-chat-sdk`。
- 影响 `apps/api/src/agent/chat` Guard。

## Non-goals

- 不新增独立后端网关。
- 不改变 RAG Admin 内部交互。
- 最终 npm 包名发布前确认。
