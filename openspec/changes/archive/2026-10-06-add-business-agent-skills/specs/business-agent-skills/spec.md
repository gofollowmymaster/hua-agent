# Spec Delta

## Purpose

为 NestJS Business Agent 提供只读系统 Skill 和用户私有 Skill，并通过管理后台维护用户指令和在聊天运行时自动装载。

## ADDED Requirements

### Requirement: 系统 Skill 只读且强制生效
系统 SHALL 从代码清单提供业务知识、DS 订单、当前时间和计算 Skill，并 SHALL 对所有 NestJS Agent 会话按固定顺序装载。

#### Scenario: 用户查看系统 Skill
- **WHEN** 已登录用户打开系统 Skill Tab
- **THEN** 页面展示全部系统 Skill 及其指令
- **THEN** 页面不提供创建、编辑、启停或删除操作

### Requirement: 用户 Skill 私有管理
系统 SHALL 允许登录用户创建、查询、修改、启停和删除自己的 Skill，并 SHALL 使用租户与用户 ID 隔离数据。

#### Scenario: 用户管理自己的 Skill
- **WHEN** 用户创建或修改符合限制的 Skill
- **THEN** 系统保存数据并仅向该租户的该用户返回

#### Scenario: 用户访问其他所有者的 Skill
- **WHEN** 用户使用其他租户或用户的 Skill ID 执行修改或删除
- **THEN** 系统返回资源不存在且不执行写入

### Requirement: 运行时自动装载
NestJS Business Agent SHALL 在每次运行时装载系统 Skill，以及可信 JWT 用户启用的个人 Skill。

#### Scenario: JWT 用户发起会话
- **WHEN** 带可信用户 ID 的 JWT 请求调用 Agent Chat
- **THEN** Agent 使用核心提示词、全部系统 Skill 和该用户启用的个人 Skill

#### Scenario: 固定密钥发起会话
- **WHEN** 固定密钥请求调用 Agent Chat
- **THEN** Agent 只装载系统 Skill
- **THEN** 请求中的 `participantId` 不得用于读取个人 Skill

### Requirement: 双 Tab 管理页面
Vue RAG Admin 与 React Admin SHALL 在 `/business-agent/skills` 同一页面中分别使用“系统 Skill”和“用户 Skill”Tab 展示两类数据。

#### Scenario: 切换 Skill Tab
- **WHEN** 用户在两个 Tab 间切换
- **THEN** 页面保留各 Tab 的筛选、分页和加载状态
- **THEN** 用户 Skill 写操作只刷新用户 Skill Tab

### Requirement: FastAPI 能力边界
FastAPI SHALL 维持现有 Agent Chat 和路由清单，不新增 Skill API 或 Skill 运行时装载。

#### Scenario: 使用 FastAPI 部署
- **WHEN** 客户端连接 FastAPI 后端
- **THEN** Skill 管理接口不可用且 Agent 保持现有固定提示词行为
