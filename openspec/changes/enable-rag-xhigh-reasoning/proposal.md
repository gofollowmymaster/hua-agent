## Why

当前 RAG 最终答案只执行普通生成，无法利用模型的高强度推理能力处理复杂问题。需要在不污染会话记忆和既有同步、企微输出的前提下，为流式客户端提供可观察的供应商 reasoning 内容，并在推理不可用时保证问答可降级。

## What Changes

- 最终答案模型默认使用标准 `reasoning_effort: xhigh`，查询改写模型保持普通生成。
- 推理生成失败或无有效答案时，使用同一回答模型移除推理参数后重试。
- SSE 新增 `reasoning` 增量事件，AGUI 映射为标准 reasoning parts；同步响应和企微保持不变。
- reasoning 与最终答案分离，不写入会话消息、短期记忆或后续 Prompt。
- RAG Admin 新增可折叠的“思考摘要”展示，并补充非敏感观测元数据。

## Capabilities

### New Capabilities

- `rag-answer-reasoning`: 定义 RAG 最终答案的 xhigh 推理、普通生成降级、reasoning 流式输出与持久化隔离。

### Modified Capabilities

无。

## Impact

影响 API 的 RAG 配置、LangGraph 答案生成节点、SSE/AGUI 适配和相关测试，以及 RAG Admin 的消息渲染组件。HTTP 同步响应、企微消息、数据库 schema 与查询改写模型不变。

## Non-goals

- 不增加请求级推理开关，不持久化或二次总结 reasoning。
- 不修改检索、重排、Prompt 和公开同步 DTO。
