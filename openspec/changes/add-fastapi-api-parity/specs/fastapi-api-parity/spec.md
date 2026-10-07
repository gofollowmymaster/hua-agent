## ADDED Requirements

### Requirement: FastAPI 必须兼容现有 API 边界

系统 MUST 在独立 FastAPI 进程中提供现有 NestJS 的 36 个 HTTP 接口，并保持方法、路径、请求转换、状态码、响应头、响应体和数据副作用兼容。

#### Scenario: 普通 JSON 请求

- **WHEN** 同一合法请求分别发送到 NestJS 和 FastAPI
- **THEN** 两者 MUST 返回等价的状态码和 `{ code, body, message }` 响应

#### Scenario: 参数校验失败

- **WHEN** 请求缺少字段或字段不符合 DTO 约束
- **THEN** FastAPI MUST 返回与 NestJS 等价的 400 错误而不是默认 422

### Requirement: 两套服务必须共享认证和租户语义

系统 MUST 兼容 supplier header、Bearer JWT、飞书固定 token、默认租户、host 校验和系统管理员权限，并 MUST 对所有持久化查询应用当前租户限制。

#### Scenario: 跨后端使用登录 token

- **WHEN** 任一后端签发 JWT 后调用另一后端
- **THEN** 另一后端 MUST 接受该 token 并解析出相同用户和租户

#### Scenario: 固定 token 鉴权

- **WHEN** 调用方使用飞书多维表格中有效且包含当前模块权限的固定 token
- **THEN** 两个后端 MUST 使用相同缓存和权限规则允许请求

### Requirement: 两套服务必须共享数据与缓存

FastAPI MUST 使用现有 Prisma schema 对应的 PostgreSQL 表和 `frontend-node:*` Redis key；数据库迁移 MUST 继续只由 Prisma 管理。

#### Scenario: 交替处理会话

- **WHEN** NestJS 创建会话或消息后下一请求由 FastAPI 处理，或顺序相反
- **THEN** 后续服务 MUST 读取到完整且租户正确的状态

#### Scenario: 部署共享 Skill 表

- **WHEN** 任一后端部署到新数据库或升级后的数据库
- **THEN** 部署流程 MUST 使用 Prisma/RAG schema 权威入口创建并校验 `agent_user_skills` 表及索引
- **AND** NestJS 与 FastAPI 应用进程 MUST NOT 在请求期间自行创建数据库表

### Requirement: AI 流必须保持 UI Message 协议

FastAPI MUST 输出现有客户端可消费的 UI Message data stream，并保持状态、reasoning、工具调用结果和正文的可见顺序。

#### Scenario: 包含工具调用的 Agent 响应

- **WHEN** Agent 依次生成 reasoning、工具调用、工具结果和正文
- **THEN** 客户端 MUST 按该顺序收到成对的 start/delta/end 事件
- **AND** 持久化 parts MUST 与可见顺序一致

#### Scenario: 流启动前依赖失败

- **WHEN** Agent 或 RAG 在加载历史、Skill 或写入启动消息时发生异常
- **THEN** FastAPI MUST 在 SSE 响应开始前由全局异常处理器返回脱敏 JSON 500

#### Scenario: 流运行期间发生异常

- **WHEN** SSE 响应开始后模型、工具、检索或持久化发生普通异常
- **THEN** FastAPI MUST 输出 `{"type":"error","errorText":"生成失败，请稍后重试"}`
- **AND** 错误响应 MUST NOT 暴露内部异常详情或发送业务完成状态及 `[DONE]`

### Requirement: FastAPI 必须可独立部署

系统 MUST 提供 Python 3.12 锁定依赖、独立 Docker 镜像、根调度命令、健康检查、非生产 OpenAPI 和 `/public` 静态资源。

#### Scenario: 独立启动

- **WHEN** 使用 FastAPI 镜像和现有外部服务配置启动容器
- **THEN** 服务 MUST 在 8000 端口就绪且不要求 NestJS 进程存在

#### Scenario: 独立选择运行环境

- **WHEN** 使用 `PYTHON_API_ENV` 启动 FastAPI
- **THEN** 服务 MUST 只加载 Python app 对应环境文件和进程变量
- **AND** 服务 MUST NOT 读取或依赖 `apps/api/.env*`

#### Scenario: 核心与可选配置校验

- **WHEN** PostgreSQL、Redis 或 JWT 核心配置缺失
- **THEN** FastAPI MUST 在启动阶段失败并只报告配置项名称
- **AND** 缺少模型、rerank 或飞书凭据 MUST NOT 阻止基础服务启动
