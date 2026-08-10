## Context

两个 Demo 页面已有相同的输入框、历史列表、消息流和状态管理，但分别依赖不同 API 文件。`packages/ui-kit` 当前只承载表格和预览能力，适合新增独立子路径承载聊天交互。

## Goals / Non-Goals

**Goals:**

- 消除两个 Demo 的组件和 hooks 重复。
- 保持后端 API 差异在 app 侧 adapter 内。
- 不影响 Global Admin。

**Non-Goals:**

- 不统一后端会话接口。
- 不迁移 Global Admin。

## Decisions

- **独立子路径**：`@aplus-sql/ui-kit/chat-demo`，不从根入口导出，避免 Global Admin 打包聊天依赖。
- **Adapter 注入**：UI Kit 不读取 store、cookie、API 或 `import.meta.env`，由 app adapter 提供 `createSession`、`pageSessions`、`listMessages`、`toUiMessages`、`formatStatus`。
- **共享页面骨架**：`ChatDemoShell` 接收 adapter 和 options，内部使用 `useChatDemo`。
- **保留业务差异**：知识问答 adapter 提供 markdown 预览回调，业务 Agent adapter 提供工具调用状态文案。

## Risks / Trade-offs

- [新 peer dependencies] → 只放在 `chat-demo` 子路径，RAG Admin 已具备，Global Admin 不导入。
- [页面迁移回归] → 保持现有交互和样式，两个页面运行构建和人工 smoke test。

## Migration Plan

1. 新增 ui-kit `chat-demo` 子路径和依赖。
2. 新增 RAG Admin 两个 adapter。
3. 迁移两个 Demo 页面。
4. 运行 ui-kit、RAG Admin、Global Admin 验证。

## Open Questions

无。
