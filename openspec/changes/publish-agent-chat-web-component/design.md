## Context

当前 `chat-demo` 使用 `@aplus-frontend/ui` 的 `ApButton` 和 aplus Less token，不能直接进入公开包。需要先解耦，再封装 Web Component。

## Goals / Non-Goals

**Goals:**

- Web Component 不依赖 aplus-ui。
- 支持 JWT 与 Secret 两种外部鉴权。
- 保持 RAG Admin 现有交互。

**Non-Goals:**

- 不发布 aplus-ui。
- 不改变后端会话模型。

## Decisions

- **原生按钮**：chat-demo 中 `ApButton` 全部替换为原生 `<button>`。
- **CSS 变量**：aplus Less token 替换为 `--agent-chat-*` 变量，并提供默认值。
- **Web Component**：新建 `packages/agent-chat-sdk`，Vite library mode 构建，bundle 运行依赖，不包含 aplus-ui。
- **后端 Guard**：Agent Chat 使用 `CompositeAuthOrSecretGuard`，外部可通过 JWT 或 Secret 调用。

## Risks / Trade-offs

- [样式与 aplus 视觉差异] → 使用默认 CSS 变量对齐主色、边框和状态色。
- [SDK 体积] → Web Component 需要 bundle Vue/ai/md-editor，公开包体积较大但可用。

## Migration Plan

1. 重构 `chat-demo` 无 aplus-ui。
2. 新增 SDK 包并完成 Web Component。
3. 切换后端 Guard。
4. 验证内部与外部接入。

## Open Questions

最终 npm 包名待发布负责人确认。
