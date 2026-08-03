## Context

当前同步和流式 RAG 问答都会在查询改写后调用 `RagBaseService.retrieve()`，该方法只执行 pgvector 余弦相似度召回。RAG schema 已有 `vector` 与 HNSW 索引，`schema.sql` 中也声明了 `zhparser`，但没有全文召回路径。用户希望一期实现多路召回，并把重排逻辑封装好，便于后续切换模型 rerank。

## Goals / Non-Goals

**Goals:**

- 将检索主链路升级为“多路召回 → 候选融合 → rerank → topK”。
- 一期支持向量召回和 PostgreSQL 全文关键词召回。
- 一期提供 `RagReranker` 抽象、规则重排和空重排，为后续模型重排预留稳定接口。
- 任一召回或重排子步骤失败时可降级，不阻断 RAG 问答。
- 不改变公开问答接口响应契约。

**Non-Goals:**

- 不引入外部检索系统。
- 不实现真实模型 rerank 调用。
- 不改变 ingestion 的 chunk 切分和 embedding 生成策略。

## Decisions

### 1. 新增 `RagRetrievalService` 承载检索编排

`RagRetrievalService` 放在 `src/ai/rag/services/qa/`，由同步和流式问答服务注入。它接收改写后的检索问题、原始问题、topK、sessionKey，内部执行各路召回、融合和重排，最终返回 `RetrievedChunk[]`。

替代方案是继续扩展 `RagBaseService.retrieve()`；但这会让抽象基类承担过多编排职责，不利于后续添加模型 rerank 和更多召回器。

### 2. 召回器用同目录内部类实现

一期新增向量召回和关键词召回两个内部能力。向量召回复用现有 embedding 与 pgvector SQL；关键词召回使用 `websearch_to_tsquery('zhparser', query)` 和 `ts_rank_cd`，并依赖新增 GIN expression index。

暂不将召回器注册为 NestJS provider，避免过多 provider 膨胀；它们作为 `RagRetrievalService` 的私有方法或轻量内部类即可。

### 3. 融合使用 RRF

不同召回路的分数尺度不同，向量 similarity 与全文 rank 不能直接相加。一期使用 RRF：

```text
score += routeWeight / (fusionK + rank)
```

候选以 `chunk.id` 去重，保留各路命中、rank 和原始分数，最终按融合分排序。

### 4. rerank 抽象先行

定义 `RagReranker` 接口，输入包含 query、originalQuestion、候选、topK、tenantCode、sessionKey。实现：

- `NoopReranker`: 直接返回候选，用作关闭和最终降级。
- `RuleBasedReranker`: 一期默认，在融合分基础上叠加关键词/标题命中奖励和同文档多样性惩罚。

后续 `ModelReranker` 只需实现相同接口，并在失败时回退到 `RuleBasedReranker`。

### 5. 配置集中进入 `vcHelper.retrieval`

新增 `retrieval` 配置对象，控制 `vectorTopK`、`keywordTopK`、`fusionK`、`rerankMode`、`rerankTopN` 等参数。业务代码统一通过 `NodeConfigService.get('vcHelper')` 读取。

## Risks / Trade-offs

- [Risk] 目标数据库未安装 `zhparser` → 迁移使用 `CREATE EXTENSION IF NOT EXISTS zhparser`，关键词召回失败时记录日志并降级到向量召回。
- [Risk] 全文查询语法异常 → 关键词召回失败不抛出主流程，记录结构化 warn。
- [Risk] 多路召回增加 SQL 次数和延迟 → 候选数配置设上限，并默认只启用两路。
- [Risk] 规则重排不如模型重排精准 → 接口预留，后续以 `ModelReranker` 替换。

## Migration Plan

1. 添加 RAG chunk 内容全文 GIN expression index。
2. 发布代码后默认启用 hybrid + rule rerank。
3. 若关键词召回异常，可通过配置将 `keywordTopK` 调小或置 0，主流程仍可向量召回。
4. 若重排异常，`RagRetrievalService` 回退融合结果。
