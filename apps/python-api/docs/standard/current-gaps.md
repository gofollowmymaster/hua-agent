# 当前实现差距

本文登记当前代码与目标规范之间的已知差距。它不是当前任务的代码整改清单；处理任一项时需重新确认影响范围、补充测试，并遵守相关专题规范。

## 优先级定义

- P1：可能影响安全、并发可靠性或接口稳定性，应优先安排。
- P2：主要影响可维护性、可测试性或长期演进，应在相关模块变更时处理。
- P3：局部一致性问题，可随邻近代码修改逐步收敛。

## P1 对外异常可能暴露内部细节

证据：`core/errors.py` 的兜底异常和唯一约束处理、`security.py` 的部分认证失败路径会把 `str(exception)` 或 `str(error)` 放入客户端消息。

风险：数据库、SDK、路径或内部实现信息可能进入 HTTP 响应。

目标：对外使用稳定、安全的错误码和消息；完整诊断仅进入脱敏服务端日志，配置错误只输出字段名。

验收：新增异常处理测试，断言响应不包含 SQL、路径、secret、Authorization 或 SDK 原始错误，同时日志保留可定位的 request metadata。

## P1 异步请求中存在同步文件处理

证据：`services/documents.py` 和 `services/agent_knowledge.py` 在 async 入库流程中直接执行 `read_text`、`read_bytes`、PDF/Office 解析与部分文件写入。

风险：大文件或并发入库可能阻塞事件循环，拖慢无关请求和 SSE 输出。

目标：将同步解析、hash 和大文件 I/O 放入 `asyncio.to_thread` 或独立任务执行，并限制并发与单任务资源占用。

验收：事件循环响应性测试证明入库期间轻量请求仍能及时执行；异常与取消路径不会遗留临时文件。

## P1 稳定响应仍大量使用宽泛字典类型

证据：routes 和 services 中广泛使用 `dict[str, Any]`、`list[dict[str, Any]]`，多数 route 未声明 `response_model`。

风险：字段拼写、空值和序列化变化难以由 mypy、OpenAPI 和评审发现。

目标：为稳定 HTTP payload、SSE event 和持久化 parts 建立 Pydantic model、TypedDict 或判别联合；第三方动态数据在边界处窄化。

验收：核心接口具有明确返回类型，mypy 能发现缺失字段，OpenAPI 输出与现有 HTTP 契约一致。

## P2 全局客户端降低测试隔离能力

证据：`database.py`、`core/redis/redis_service.py` 和 `feishu.py` 在模块级创建 engine、client 或 singleton；部分 service 构造时直接创建模型 client。

风险：导入阶段依赖配置，测试替换和资源生命周期验证较难，多个测试之间可能共享状态。

目标：保留进程级资源复用，同时通过 application state、FastAPI dependency、factory 或构造参数提供明确替换点。

验收：单元测试无需真实配置即可导入被测模块，能够替换数据库、Redis、时钟、模型和飞书 client，并验证关闭行为。

## P2 Service 职责和文件规模偏大

证据：`services/agent_chat.py`、`services/agent_knowledge.py`、`services/documents.py` 同时承担协议适配、业务编排、序列化、SQL 和工具定义。

风险：修改一个协议或存储细节容易扩大回归范围，局部逻辑难以单测。

目标：按稳定职责拆分 runtime/event adapter、document parser、repository/query 和业务 orchestrator，避免只为缩短文件而机械拆分。

验收：拆分后的模块依赖单向，每个协作者可独立测试，公开 route 与持久化行为不变。

## P2 长原生 SQL 嵌入业务流程

证据：知识检索、文档替换和会话 upsert 的多段 SQL 直接位于 service 方法中。

风险：租户条件、cast、排序和冲突更新难以复用和集中审查。

目标：将复杂且重复的 SQL 下沉到按领域组织的 query/repository 模块，继续使用命名参数，并保持事务由 service 编排。

验收：针对每条 query 覆盖租户隔离、空结果、排序、vector/JSONB cast 和 upsert 行为。

## P2 集成验证覆盖不足

证据：当前测试主要覆盖路由清单、配置、健康检查、密码/Redis key/SSE 编码和部分 Agent 流程；数据库、Redis、文件解析、模型和飞书的大部分路径依赖 mock 或尚无集成测试。

风险：静态检查通过仍不能证明真实依赖、事务、副作用和资源关闭正确。

目标：建立可重复启动的隔离 PostgreSQL/Redis 测试环境，扩充租户、入库、检索、会话、文件和生命周期测试；实时外部服务保持显式 opt-in。

验收：CI 或标准本地流程能稳定运行核心集成测试，跳过项清楚说明所缺外部条件。

## P3 错误消息和术语不完全统一

证据：当前错误消息同时存在中文和英文，部分模块使用 route/service/schema 等英文术语，部分使用中文业务术语。

风险：调用方展示和排障体验不一致。

目标：面向客户端的业务错误统一语言和术语；日志可保留必要技术标识。

验收：同类校验、未找到、未认证和配置错误使用稳定消息模板，现有调用方行为经过回归验证。

