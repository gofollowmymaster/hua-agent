# Spec Delta

## ADDED Requirements

### Requirement: 知识问答使用 React UI Kit

`/knowledge/assistant` SHALL 使用 `@aplus-sql/react-ui-kit`，并保留 RAG 历史、流式回答、Markdown 和引用文档预览。

#### Scenario: 点击内部文档引用
- **WHEN** 用户点击回答中的文档预览链接
- **THEN** 页面继续在当前页面打开文档预览 Modal

### Requirement: 业务 Agent 使用 React UI Kit

`/business-agent/demo` SHALL 使用 `@aplus-sql/react-ui-kit`，并保留有序 parts 与旧历史回退。

#### Scenario: 加载旧 Agent 历史
- **WHEN** 历史消息没有有效的有序 parts
- **THEN** adapter 先恢复旧工具结果再展示最终文本，不推断未知交错顺序
