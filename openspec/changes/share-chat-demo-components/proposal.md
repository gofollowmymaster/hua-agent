## Why

知识问答和业务 Agent 两个 Demo 页面交互高度一致，但组件、hooks 和页面状态逻辑存在重复；后端服务不同，直接复制会持续产生维护成本。

## What Changes

- 在 `packages/ui-kit` 新增独立 `chat-demo` 子路径，提供共享聊天交互组件和 hook。
- 用 `ChatDemoAdapter` 隔离不同后端服务。
- 两个 Demo 页面迁移为 adapter + `ChatDemoShell` 薄包装。

## Capabilities

### New Capabilities

- `chat-demo-ui-kit`: 提供共享聊天交互组件、hooks 和 adapter 契约。
- `chat-demo-page-migration`: 知识问答与业务 Agent Demo 迁移到共享组件。

### Modified Capabilities

无。

## Impact

- 影响 `packages/ui-kit` exports、依赖和测试。
- 影响 `apps/rag-admin` 两个 Demo 页面和 API adapter。
- 不影响 Global Admin 根入口。

## Non-goals

- 不统一后端聊天 API。
- 不修改后端服务。
- 不新增第二套聊天协议。
