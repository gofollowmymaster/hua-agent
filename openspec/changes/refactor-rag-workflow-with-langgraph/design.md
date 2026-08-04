## Context

同步问答由 `RagQueryService` 编排，流式问答由 `RagStreamService` 重复编排；两者都调用将向量召回、关键词召回、融合和重排封装在一起的 `RagRetrievalService.retrieve()`。现有 LangSmith 环境配置可以追踪 LangChain 调用，但无法清晰展示召回分支和图状态迁移。

## Goals / Non-Goals

**Goals:**

- 用一张强类型 `StateGraph` 统一同步与流式主流程。
- 将向量和关键词召回建模为并行独立节点，并在融合节点前 fan-in。
- 保持原有降级、租户隔离、消息持久化顺序及公开协议。
- 通过节点 trace 和结构化日志提供耗时、候选数、执行状态观测。

**Non-Goals:**

- 不增加 checkpointer、数据库迁移或新的检索通道。
- 不修改 RRF、规则 rerank、Prompt 和查询改写策略。
- 不向客户端暴露新增的节点级状态事件。

## Decisions

### 1. 单一 StateGraph 覆盖完整问答链路

`RagQueryService` 持有编译后的图，节点依次处理会话、记忆、查询改写、检索、Prompt、生成、消息持久化和结果组装。同步入口调用图的 `invoke`；流式入口调用图的 `stream` `custom` 模式。同步、SSE 和 AGUI 入口集中在同一服务，避免为协议转发保留无业务职责的 Service。替代方案是只建立检索子图，但会继续保留两套问答编排。

### 2. 使用独立状态字段实现并行召回

`retrieve_vector` 和 `retrieve_keyword` 分别写入 `vectorResult` 与 `keywordResult`，通过 LangGraph 多起点 edge 并行执行，并使用 waiting edge 在 `fuse_candidates` 汇合。不同字段避免并行更新冲突，也能在 LangSmith 中独立检查输出。

### 3. 检索 facade 委托独立阶段 Service

保留 `RagRetrievalService` 作为稳定 facade，并将向量召回、全文召回、RRF 融合和 rerank 分别委托给独立 NestJS Service。每路 Retriever 实现统一契约，返回 `{ route, status, candidates, durationMs }`；失败仍记录 warn 并返回空候选，不中断另一召回节点。工作流继续调用 facade 的阶段方法，保持节点拓扑和入口签名不变。

候选诊断使用按 route 存储的 `ranks` 与 `scores`，避免新增检索方式时扩充专用 rank/score 字段。向量和全文检索仍分别使用 `vector` 与 `keyword` route，现有节点名和日志口径保持不变。

### 4. 重排使用独立策略服务

`RagRerankService` 负责候选截取、策略选择、诊断和失败回退；`NoopReranker` 与 `RuleBasedReranker` 通过统一接口注入。`model` 模式仍回退规则重排，不在本次实现模型调用。

### 5. 通过 custom stream 兼容现有协议

图节点使用 runtime writer 输出既有 `RagStreamEvent`。生成节点在流式模式逐 token 写入 `answer`，异常或空流时输出既有 `fallback_start` 并调用 `invoke`；同步模式直接调用 `invoke`。`RagQueryService` 同时负责 AsyncGenerator 和 AGUI 协议转换。

### 6. 复用现有业务持久化，不使用 checkpointer

图不配置 checkpointer。`RagMemoryService` 继续负责会话解析、短期记忆和消息写入，避免 LangGraph 状态与业务会话产生双重真源。

### 7. Trace 元数据最小化

图运行设置固定 run name、执行模式 tag，以及 tenant、session、channel、topK metadata。结构化日志仅记录节点、耗时、候选数和状态，不记录问题、回答或文档正文。

## Risks / Trade-offs

- [Risk] LangGraph 并发状态更新冲突 → 两路召回写入不同状态字段，并使用显式 waiting edge 汇合。
- [Risk] 流式重构改变客户端事件顺序 → 只在原有语义节点写出既有状态，并用回归测试固定顺序。
- [Risk] 单路召回异常被空结果掩盖 → 节点结果显式记录 `success`、`disabled` 或 `failed`，同时保留 warn 日志。
- [Risk] LangSmith trace 包含图状态 → 日志不记录内容，LangSmith 数据权限沿用当前项目治理。

## Migration Plan

1. 增加依赖并注册持有共享工作流的 `RagQueryService`。
2. 将检索阶段拆为图节点可调用的方法并补充测试。
3. 切换同步、SSE 和 AGUI 入口到共享图。
4. 运行 API 测试和构建；回滚时恢复原 Service 编排并移除新增依赖，不涉及数据回滚。

## Open Questions

- 无。
