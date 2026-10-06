## Context

NestJS Business Agent 当前在单例构造阶段创建 Deep Agent，工具和系统提示词均为固定值。管理后台已有 `/business-agent/skills` 路由，但 Vue 与 React 页面都是占位实现。RAG PostgreSQL 已保存后台用户，可通过 `TenantContext` 获取可信的租户和 JWT 用户 ID。

## Decisions

- 系统 Skill 使用代码清单，稳定 key 为 `business-knowledge`、`ds-order`、`current-time` 和 `calculator`；清单只读且全部强制装载。
- 用户 Skill 使用 `agent_user_skills` 表，所有查询和写入都带 `tenant_code + user_id`，删除用户时级联删除个人 Skill。
- 用户 Skill 名称 1-64 字、描述最多 500 字、指令 1-12000 字；每个用户最多启用 20 个，启用指令总长度不超过 30000 字。
- API 使用 `AuthGuard`，固定密钥不能访问管理接口。系统列表与用户分页、创建、修改、删除使用独立路由。
- Agent 每次运行前查询 Skill 并创建本次 Deep Agent；模型、工具服务和中间件配置继续复用。系统 Skill 按清单顺序、用户 Skill 按创建时间和 ID 排序。
- 核心提示词保留身份、安全优先级、禁止编造、原生工具调用和订单写操作显式授权规则。Skill 作为受边界标记的补充指令，不能扩大工具或权限。
- JWT 请求只使用 `TenantContext.userId` 装载个人 Skill；没有可信用户 ID 的固定密钥会话只装载系统 Skill，忽略 `participantId`。
- 两套前端均在单一路由页内提供“系统 Skill”和“用户 Skill”Tab。系统 Tab 只读；用户 Tab 支持筛选、分页、新建、编辑、启停、详情和删除。

## Risks / Trade-offs

- 每次请求创建 Deep Agent 会增加少量初始化成本，但确保用户修改立即生效并避免跨用户缓存污染。
- 用户指令会影响模型行为，通过核心规则优先级、长度限制和固定工具集合控制风险。
- FastAPI 与 NestJS 会暂时存在能力差异；部署 FastAPI 时 Skill 页面和动态装载不可用。
