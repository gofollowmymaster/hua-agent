## MODIFIED Requirements

### Requirement: 系统 Skill 只读且强制生效
系统 SHALL 从等价的 TypeScript 与 Python 代码清单提供业务知识、DS 订单、当前时间和计算 Skill，并 SHALL 对 NestJS 与 FastAPI Agent 会话按固定顺序装载。

#### Scenario: 双后端返回系统 Skill
- **WHEN** 已登录用户分别从 NestJS 与 FastAPI 查询系统 Skill
- **THEN** 两端返回的字段、内容和顺序 SHALL 等价
- **THEN** 两端均不提供系统 Skill 写接口

### Requirement: 运行时自动装载
NestJS 与 FastAPI Business Agent SHALL 在每次运行时装载系统 Skill，以及可信 JWT 用户启用的个人 Skill。

#### Scenario: JWT 用户发起会话
- **WHEN** 带可信用户 ID 的 JWT 请求调用任一后端的 Agent Chat
- **THEN** Agent 使用核心提示词、全部系统 Skill 和该用户启用的个人 Skill
- **THEN** 用户 Skill 修改 SHALL 在下一次运行立即生效

#### Scenario: 固定密钥发起会话
- **WHEN** 固定密钥请求调用任一后端的 Agent Chat
- **THEN** Agent 只装载系统 Skill
- **THEN** 请求中的 `participantId` 不得用于读取个人 Skill

### Requirement: FastAPI 能力边界
FastAPI SHALL 提供与 NestJS 等价的五个 Skill API、用户隔离规则、启用限制和 Agent 运行时动态装载能力。

#### Scenario: 使用 FastAPI 管理 Skill
- **WHEN** 客户端以 Bearer JWT 调用 FastAPI Skill 管理接口
- **THEN** 方法、路径、校验、响应结构和业务错误 SHALL 与 NestJS 等价
- **THEN** 固定密钥 SHALL NOT 获得 Skill 管理权限
