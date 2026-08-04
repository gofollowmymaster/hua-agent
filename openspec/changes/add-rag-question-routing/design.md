## Context

当前共享 `StateGraph` 在持久化用户消息后固定执行查询改写、向量与全文并行召回、融合、重排和 xhigh 回答生成。该链路对业务问题必要，但无意义输入、寒暄及明确无关问题也会产生检索延迟。现有查询改写已使用 `qwen-turbo`，回答服务同时持有 xhigh 推理模型和不带推理参数的普通模型。

## Goals / Non-Goals

**Goals:**

- 以可观测的独立 LangGraph 节点将问题分为 `rag` 与 `direct`。
- 仅让亚马逊跨境电商相关或无法明确判断的问题进入现有检索链路。
- 直答分支复用短期记忆和普通回答模型，跳过改写、检索、重排与 reasoning。
- 保持公共响应、SSE、AGUI、企微和消息持久化契约不变。

**Non-Goals:**

- 不合并路由与查询改写，不新增路由配置或请求参数。
- 不改变召回、融合、重排、RAG Prompt 或 xhigh 推理逻辑。
- 不持久化路由诊断，不修改前端和数据库。

## Decisions

### 1. 使用独立路由 Service 和条件节点

新增 `RagQuestionRouterService`，使用与查询改写相同的 `qwen-turbo` 配置及结构化输出 `{ route, routeReason }`。工作流在加载记忆和持久化用户消息后执行 `route_question`，再通过 conditional edge 分支。相比在 workflow 内直接调用模型，独立 Service 更便于单测、日志隔离和后续替换分类策略。

### 2. 模糊或失败时保守进入 RAG

明确的寒暄、无意义或非亚马逊跨境电商问题选择 `direct`；业务相关、依赖上下文的相关追问及无法高置信判断的问题选择 `rag`。模型异常、空响应或结构化解析失败也返回带降级诊断的 `rag`，避免业务问题绕过知识库。

### 3. 两条分支共享生成后处理

RAG 分支保持原链路并构建 `qa` Prompt；direct 分支构建只含问题与短期记忆的 `direct` Prompt。两者汇合到 `generate_answer`：RAG 使用 xhigh 模型，direct 使用普通模型。之后统一持久化助手消息和构建结果，direct 因 chunks 为空自然返回空 sources/chunks。

### 4. 状态事件按真实路径输出

`analyzing_start` 移至路由完成后的 RAG 路径；`retrieve_start`、`retrieve_done` 和 `generate_start` 的 RAG 顺序不变。direct 仅输出 `generate_start`、回答和 `done`，普通模型流为空或失败时沿用 `fallback_start`。不增加新的公开 stage。

### 5. 诊断不记录内容

节点日志和 LangSmith metadata 仅记录 route、状态、耗时、是否降级及已有 tenant/session/channel 信息，不记录问题、路由原因、Prompt、回答或文档正文。

## Risks / Trade-offs

- [Risk] 路由误判导致业务问题直答 → 模糊和异常统一回退 RAG，并用领域边界测试固定分类提示词。
- [Risk] RAG 问题增加一次小模型调用 → 复用 `qwen-turbo`，保留路由与改写的独立可观测性。
- [Risk] direct 回答缺少知识库约束 → direct Prompt 明确不得声称检索或生成引用，业务相关问题由路由进入 RAG。
- [Trade-off] direct 不输出 reasoning → 换取简单问题更低延迟，RAG 复杂问题仍保持 xhigh。

## Migration Plan

注册新 Service 和 Prompt 后直接切换共享图拓扑，无数据迁移。回滚时移除条件节点并恢复 `persist_user_message → rewrite_query` 固定 edge 即可。

## Open Questions

无。
