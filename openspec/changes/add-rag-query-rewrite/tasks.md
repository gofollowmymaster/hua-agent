## 1. Prompt 与服务

- [x] 1.1 新增 `prompts/rewrite/v1.ts`，定义查询改写提示词。
- [x] 1.2 在 `PromptRegistryService` 注册 `rewrite` 分类。
- [x] 1.3 新增 `RagQueryRewriteService`，实现改写、空结果回退、异常回退和结构化日志。
- [x] 1.4 在 `AiModule` 注册新增 provider。
- [x] 1.5 使用 `StructuredOutputParser` 和 `zod` schema 解析查询改写结构化输出。

## 2. 问答链路集成

- [x] 2.1 在同步问答中加载记忆后调用改写，检索使用改写问题。
- [x] 2.2 在流式问答中加载记忆后调用改写，检索使用改写问题。
- [x] 2.3 保持 QA prompt 使用用户原始问题。
- [x] 2.4 确认不改变 DTO、响应结构、SSE event 和 AGUI 输出。

## 3. 测试与验证

- [x] 3.1 新增 `RagQueryRewriteService` 单元测试，覆盖无记忆、带记忆、空输出和模型异常回退。
- [x] 3.2 新增/更新 `RagQueryService` 单元测试，覆盖检索使用改写问题、回答使用原问题。
- [x] 3.3 新增/更新 `RagStreamService` 单元测试，覆盖流式链路使用改写问题和 fallback 不阻断生成。
- [x] 3.4 运行相关 Jest 测试。
