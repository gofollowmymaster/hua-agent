## ADDED Requirements

### Requirement: 多路召回

RAG 问答系统 SHALL 在检索知识片段时支持至少向量召回和关键词召回两路候选，并 MUST 保持租户隔离条件。

#### Scenario: 混合召回返回候选

- **WHEN** 用户发起 RAG 问答且知识库中存在同租户可命中的片段
- **THEN** 系统 SHALL 从向量召回和关键词召回中合并候选，并只返回同租户片段

#### Scenario: 关键词召回失败降级

- **WHEN** 关键词召回因数据库全文能力不可用或查询异常失败
- **THEN** 系统 MUST 记录降级日志，并继续使用其他召回路径生成候选

### Requirement: 候选融合

RAG 问答系统 SHALL 对多路召回候选按片段去重，并使用可配置融合策略计算最终候选顺序。

#### Scenario: 重复片段合并

- **WHEN** 同一片段同时被向量召回和关键词召回命中
- **THEN** 系统 SHALL 只保留一个候选，并保留该片段的多路召回元信息

#### Scenario: 融合后限制候选数

- **WHEN** 多路召回候选数超过配置的重排候选数
- **THEN** 系统 SHALL 只将融合排序后的前 N 个候选交给重排器

### Requirement: 可切换重排

RAG 问答系统 SHALL 通过统一 `RagReranker` 抽象执行重排，一期 MUST 支持规则重排和空重排，后续模型重排 MUST 能在不改变问答主流程的情况下接入。

#### Scenario: 规则重排

- **WHEN** 配置的重排模式为 `rule`
- **THEN** 系统 SHALL 使用规则重排候选，并返回最终 topK 片段

#### Scenario: 关闭重排

- **WHEN** 配置的重排模式为 `none`
- **THEN** 系统 SHALL 跳过规则重排，并按融合结果返回最终 topK 片段

#### Scenario: 重排失败降级

- **WHEN** 当前重排器执行失败
- **THEN** 系统 MUST 记录降级日志，并按融合结果或空重排结果返回最终 topK 片段
