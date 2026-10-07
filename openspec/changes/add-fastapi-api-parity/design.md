# Design

## Context

NestJS API 当前提供 36 个 HTTP 入口，包含本地用户、多租户、飞书固定 token、RAG 文档与会话、Business Agent Skill、pgvector/zhparser 检索、AI SDK UI Message 流和 Deep Agents 工具调用。Python 实现需要长期与 NestJS 交替承接请求，并直接读取彼此写入的数据库和缓存状态。

## Goals / Non-Goals

**Goals:**

- 对调用方保持 HTTP、文件和流式协议兼容。
- 使用同一 PostgreSQL schema、Redis key、JWT claims 和飞书数据源。
- Python 服务可独立开发、测试、构建和部署。
- 通过差异测试持续发现双栈漂移。

**Non-Goals:**

- 不逐类复制 NestJS 内部结构。
- 不在 Python 侧创建第二套数据库迁移历史。
- 不保证真实大模型两次生成的自然语言逐字相同。

## Decisions

### 1. 以边界兼容而不是内部结构兼容为准

FastAPI 使用 router、service、repository 和 integration 分层。Pydantic、异常处理器和响应中间件负责还原 NestJS 的输入转换、400 错误和 `{ code, body, message }` 包装；SSE 与文件响应显式跳过包装。

### 2. Prisma 保持唯一 schema 权威

Python 通过 SQLAlchemy async 映射现有表，并对 pgvector、zhparser 使用参数化 SQL。项目不引入 Alembic；模型漂移由 schema 对照测试发现。请求只能路由到一个后端，避免应用层双写。

### 3. 共享认证和请求上下文

Starlette 中间件按 supplier header、Bearer claims、飞书固定 token、默认租户的顺序建立 `contextvars` 上下文。JWT、scrypt 哈希、host 校验和管理员初始化保持现有语义。

### 4. 流事件经兼容层编码

LangChain、LangGraph 和 Deep Agents 的原生事件先转换为稳定的内部事件，再输出 AI SDK UI Message data stream。兼容层负责 reasoning、tool、text 的严格顺序、累计片段去重和结束事件。

### 5. 独立镜像和入口

FastAPI 默认监听 8000，并使用独立 Dockerfile。根命令只调度 Python 项目，不改变现有 Node Dockerfile。`/public` 复用现有静态产物；readiness 仅检查 PostgreSQL、Redis 和必要配置。

### 6. Python 配置独立且按环境分层

FastAPI 不读取 `apps/api/.env*`。`PYTHON_API_ENV`（兼容回退 `NODE_ENV`）选择 `dev`、`test` 或 `prod`，并按基础、环境、本地覆盖、进程变量的顺序加载。PostgreSQL、Redis、JWT 启动即校验；模型、rerank、飞书仅在调用时校验。真实密钥不提交，也不复制到镜像层。

### 7. Skill 清单双语言维护并按请求装载

系统 Skill 在 TypeScript 与 Python 中分别以代码清单维护，并通过差异契约测试校验 key、内容和顺序。FastAPI 映射 Prisma 管理的 `agent_user_skills` 表，不引入 Alembic；管理接口只接受 Bearer JWT。每次 Agent 运行重新查询当前 JWT 用户启用的 Skill 并创建本次运行的 agent，固定密钥会话只装载系统 Skill，`participantId` 不参与用户 Skill 归属判断。

### 8. 共享 RAG schema 显式初始化

NestJS 与 FastAPI 部署前统一通过 `apps/api` 提供的环境化 RAG schema 命令应用幂等基线 SQL，并校验 `agent_user_skills` 表、所有者唯一约束和查询索引。应用进程不在启动或请求期间执行 DDL，Python 侧继续不维护独立迁移历史。

### 9. 流启动前预检与统一运行期错误边界

Agent 与 RAG 在创建 `StreamingResponse` 前完成历史、Skill 和用户消息写入等必要准备，使启动依赖失败继续由全局异常处理器返回 JSON。响应开始后的普通异常由 `core.stream` 记录脱敏诊断并转换为 AI SDK `error` 事件；异常流不发送业务完成状态或 `[DONE]`，客户端取消继续按取消语义传播。

## Risks / Trade-offs

- [Python 与 TypeScript AI 库事件存在差异] -> 使用内部事件模型和固定 provider mock 做流差异测试。
- [共享表和缓存发生格式漂移] -> 增加跨服务读写与 Redis 原始值测试，Prisma 保持唯一迁移权威。
- [飞书测试误发真实消息] -> 单测默认 mock SDK，真实 smoke test 必须显式开关并使用测试租户。
- [长期双栈功能漂移] -> 新增 API 行为时要求同时更新契约样本和两侧实现。
- [双语言系统 Skill 清单漂移] -> 差异测试比较完整字段与固定顺序。
- [跨请求 agent 缓存污染用户提示词] -> 每次运行按可信身份加载 Skill 并创建独立 agent。

## Rollout

1. 以当前 NestJS 实现生成路由和契约基线。
2. 独立部署 FastAPI，仅在测试环境和指定客户端切换 base URL。
3. 通过共享存储互操作和全部差异测试后允许生产灰度。
4. 两套服务长期使用独立地址；网关不得对同一请求双发。
