## Why

当前所有问题都会执行查询改写、双路召回和重排，寒暄、无意义输入及明确与亚马逊跨境电商无关的问题也承担完整检索延迟。需要在共享 LangGraph 中先判断问题路由，仅让业务相关或无法明确判断的问题访问知识库。

## What Changes

- 新增基于 `qwen-turbo` 和短期记忆的问题路由，输出 `rag | direct`，失败或模糊时保守选择 `rag`。
- 在 LangGraph 中增加显式条件分支：`rag` 保持现有改写和检索链路，`direct` 跳过全部检索节点。
- 新增直答 Prompt，使用普通回答模型生成，不启用 xhigh reasoning，结果不包含来源和片段。
- 保持同步、SSE、AGUI、企微接口不变，并为两条路径记录非敏感节点诊断。

## Capabilities

### New Capabilities

- `rag-question-routing`: 定义亚马逊跨境电商问题的 RAG 路由、普通直答、保守降级和流式状态行为。

### Modified Capabilities

无。

## Impact

影响 RAG Prompt Registry、问答工作流、NestJS Provider 注册和内部测试。复用现有 `qwen-turbo`、回答模型、会话记忆与 LangGraph，不增加依赖、环境变量、数据库变更或公开协议字段。

## Non-goals

- 不合并路由与查询改写，不新增请求级路由开关。
- 不修改检索算法、重排策略、前端展示或 reasoning 持久化策略。
