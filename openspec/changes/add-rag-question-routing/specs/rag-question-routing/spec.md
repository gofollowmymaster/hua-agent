## ADDED Requirements

### Requirement: 问题必须先执行领域路由
RAG 系统 MUST 在查询改写和知识库检索前，结合当前问题与短期记忆将请求路由为 `rag` 或 `direct`。明确涉及亚马逊跨境电商的问题 MUST 选择 `rag`；明确无关、寒暄或无意义输入 MUST 选择 `direct`。

#### Scenario: 亚马逊跨境电商问题
- **WHEN** 用户询问店铺、Listing、ASIN、FBA/FBM、广告、订单、库存、物流、支付、税务、合规、运营或平台政策
- **THEN** 系统 MUST 将问题路由到 `rag`

#### Scenario: 无关或无意义问题
- **WHEN** 用户输入寒暄、感谢、纯标点、乱码或明确与亚马逊跨境电商无关的问题
- **THEN** 系统 MUST 将问题路由到 `direct`

#### Scenario: 依赖会话记忆的追问
- **WHEN** 当前问题包含指代或省略且短期记忆表明其延续亚马逊跨境电商话题
- **THEN** 系统 MUST 将问题路由到 `rag`

### Requirement: 路由异常必须保守降级
路由模型调用失败、超时、返回空内容、非法结构或无法明确判断领域时，系统 MUST 选择 `rag` 并记录不含问题正文的降级诊断。

#### Scenario: 路由模型失败
- **WHEN** 路由模型抛出异常或结构化输出解析失败
- **THEN** 系统 MUST 继续执行现有 RAG 链路
- **AND** 结构化日志 MUST 仅包含 route、状态、耗时和非敏感会话元数据

#### Scenario: 领域判断模糊
- **WHEN** 当前问题与短期记忆不足以高置信判断是否属于亚马逊跨境电商
- **THEN** 系统 MUST 保守选择 `rag`

### Requirement: RAG 路径保持现有检索与推理行为
选择 `rag` 后，系统 SHALL 继续执行独立查询改写、向量与全文并行召回、融合、重排、RAG Prompt 和 xhigh 推理生成，并保持现有来源构建与降级语义。

#### Scenario: RAG 路径生成答案
- **WHEN** 问题路由结果为 `rag`
- **THEN** 系统 MUST 执行现有查询改写和完整检索链路
- **AND** 流式状态 MUST 保持 `analyzing_start`、`retrieve_start`、`retrieve_done`、`generate_start`、`done` 的既有顺序

### Requirement: Direct 路径必须跳过知识库检索
选择 `direct` 后，系统 MUST 跳过查询改写、所有召回、融合与重排节点，使用短期记忆和普通回答模型生成答案，且 MUST NOT 输出 reasoning 或知识库引用。

#### Scenario: Direct 同步回答
- **WHEN** 问题路由结果为 `direct` 且使用同步入口
- **THEN** 系统 MUST 使用不带 reasoning effort 的普通回答模型
- **AND** 响应的 `sources` 与 `chunks` MUST 为空数组

#### Scenario: Direct 流式回答
- **WHEN** 问题路由结果为 `direct` 且使用流式入口
- **THEN** 系统 MUST 仅输出 `generate_start`、answer 和 `done`
- **AND** 系统 MUST NOT 输出 `analyzing_start`、`retrieve_start`、`retrieve_done` 或 reasoning

#### Scenario: Direct 流式生成降级
- **WHEN** 普通回答模型流为空或抛出异常
- **THEN** 系统 MUST 输出既有 `fallback_start` 并使用同一普通模型的同步调用生成答案

### Requirement: 公共接口与消息持久化必须兼容
问答路由 MUST NOT 修改同步响应、SSE、AGUI、企微接口或数据库结构。所有路径的用户问题与最终助手答案 MUST 继续写入现有会话记忆。

#### Scenario: Direct 消息持久化
- **WHEN** direct 分支成功生成答案
- **THEN** 系统 MUST 按现有顺序持久化用户消息和最终助手消息
- **AND** reasoning、路由原因和诊断信息 MUST NOT 写入会话消息
