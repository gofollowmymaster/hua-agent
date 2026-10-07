# Design

## Context

当前 React hooks 已间接运行 AI SDK 7，而各 transport、NestJS 流生成器及 Vue 消费端仍直接依赖 AI SDK 6。历史消息由 adapter 直接转换，不经过实时 SDK，因此版本错配主要影响新消息流。

## Decisions

### 统一版本源

workspace catalog 固定 `ai@7.0.130`、`@ai-sdk/react@4.0.133` 和 `@ai-sdk/vue@4.0.130`。应用与开发依赖使用 catalog，公共 UI Kit peer dependency 使用对应兼容范围。

### 保持协议与公共接口

继续使用 `DefaultChatTransport`、`createUIMessageStream` 和 `pipeUIMessageStreamToResponse`。不修改请求正文、SSE 事件、响应头、adapter 或会话工作区公共接口。

### 真实流回归

组件测试使用真实 AI SDK transport/hook 消费分段 SSE，验证 reasoning 在正文前实时出现并在结束后保留。NestJS 和 Python 输出继续由协议级测试约束。

## Risks / Trade-offs

- [AI SDK 7 类型收紧] -> 在业务 adapter 边界补充明确的 data part 类型，不使用无边界断言绕过。
- [跨 workspace 影响范围大] -> 分别运行后端、两个 UI Kit、两个 Admin 和发布 SDK 的测试与构建。
- [SSE 行为意外变化] -> 固定 `reasoning-start/delta/end`、`data-status`、`error` 与正常终止回归。

## Migration Plan

1. 建立统一 catalog 并更新全部直接依赖。
2. 修复 AI SDK 7 暴露的类型或运行时兼容问题。
3. 增加实时 reasoning 与跨后端协议测试。
4. 完成跨 workspace 构建、浏览器和依赖树验证。
