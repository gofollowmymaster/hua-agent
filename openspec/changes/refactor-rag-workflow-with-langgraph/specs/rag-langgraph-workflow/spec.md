## ADDED Requirements

### Requirement: RAG 主链路图编排

RAG 问答系统 SHALL 使用同一 LangGraph 工作流编排会话解析、记忆加载、用户消息持久化、查询改写、知识召回、候选融合、重排、Prompt 构建、答案生成、助手消息持久化和结果组装。

#### Scenario: 同步问答执行共享工作流

- **WHEN** 用户调用同步 RAG 问答接口
- **THEN** 系统 SHALL 通过共享工作流执行完整问答链路
- **AND** 系统 MUST 保持现有同步响应结构

#### Scenario: 流式问答执行共享工作流

- **WHEN** 用户调用 SSE 或 AGUI 流式问答接口
- **THEN** 系统 SHALL 通过同一共享工作流逐段输出答案
- **AND** 系统 MUST 保持现有流事件结构和生成 fallback 语义

### Requirement: 多路召回独立并行节点

RAG 问答系统 SHALL 将向量召回和关键词召回实现为独立命名节点，并 SHALL 在查询改写完成后并行执行，在两路完成后再执行融合和重排。

#### Scenario: 两路召回并行后汇合

- **WHEN** 改写后的检索查询进入召回阶段
- **THEN** 向量召回节点和关键词召回节点 SHALL 可独立执行和观测
- **AND** 融合节点 MUST 等待两路召回节点均完成后执行

#### Scenario: 单路召回失败降级

- **WHEN** 任一召回节点执行失败
- **THEN** 系统 MUST 记录该节点失败状态和降级日志
- **AND** 系统 SHALL 使用其他召回节点的候选继续执行融合、重排和回答生成

### Requirement: 节点级观测

RAG 问答系统 SHALL 为工作流和独立节点提供稳定名称，并 SHALL 在 LangSmith trace 与结构化日志中记录非敏感运行元数据、节点耗时、候选数和降级状态。

#### Scenario: 调试召回链路

- **WHEN** 开发人员查看一次 RAG 问答 trace
- **THEN** 系统 SHALL 可分别识别向量召回、关键词召回、融合和重排节点
- **AND** 结构化日志 MUST NOT 包含问题、回答或文档正文

### Requirement: 会话状态单一来源

RAG 工作流 MUST 继续使用现有 RAG 会话与消息持久化服务，且 MUST NOT 引入 LangGraph checkpointer 作为第二套会话状态来源。

#### Scenario: 问答消息持久化

- **WHEN** 工作流执行一次成功问答
- **THEN** 系统 SHALL 在检索前写入用户消息并在答案完成后写入助手消息
- **AND** 系统 SHALL 使用现有会话键和短期记忆规则
