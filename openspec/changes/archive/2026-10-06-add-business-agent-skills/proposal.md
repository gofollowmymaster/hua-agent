## Why

业务 Agent 当前把所有使用说明写死在单一系统提示词中，管理后台的 Skill 页面仍是占位状态，用户无法维护自己的工作指令。需要建立只读系统 Skill 与用户私有 Skill 的统一能力，并在聊天运行时动态装载。

## What Changes

- 新增代码预置、全平台只读且强制启用的系统 Skill。
- 新增按租户和登录用户隔离的用户 Skill 持久化、管理 API 与运行时装载。
- Vue RAG Admin 与 React Admin 在同一 Skill 页面用两个 Tab 展示系统 Skill 和用户 Skill。
- 将现有知识检索、DS 订单、当前时间和计算说明迁移为系统 Skill，同时保留不可覆盖的核心安全规则。

## Capabilities

### New Capabilities

- `business-agent-skills`: 管理系统 Skill 和用户 Skill，并为 NestJS Business Agent 动态组合指令。

### Modified Capabilities

- `react-admin-console`: Skill 管理从占位页面变为与 Vue 后台等价的可用页面。

## Impact

- 影响 RAG PostgreSQL schema、NestJS `agent` 模块、Agent 运行时和两套管理后台。
- FastAPI 本期不新增 Skill API 或运行时装载，形成明确的双栈能力差异。

## Non-goals

- 不执行用户脚本，不上传附件，不动态注册工具。
- 不提供系统 Skill 的后台编辑或关闭能力。
- 不提供管理员代管或租户内共享用户 Skill 的能力。
