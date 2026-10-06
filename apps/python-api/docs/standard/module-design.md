# 模块设计规范

## Router

router 只负责 HTTP 边界：

- 声明 path、method、tag、鉴权 dependency 和数据库 dependency。
- 接收已经由 Pydantic 校验的输入。
- 调用一个主要 service 用例并返回结果。
- 为文件或流式响应设置必要 header。

router 不得直接编写 SQL、访问 Redis、调用模型或实现复杂状态迁移。新增接口必须显式选择公开、Bearer、系统管理员、固定 token 或组合鉴权，不能依赖调用方“通常会带 token”。

## Schema

- 请求 model 继承 `ApiModel`，复用 `populate_by_name=True` 和 `extra="ignore"` 行为。
- JSON camelCase 字段通过 `Field(alias=...)` 声明，Python 属性保持 snake_case。
- 长度、范围、枚举和跨字段约束在 Pydantic schema 中表达。
- validator 只做输入归一化和结构校验，不访问数据库、Redis、文件或远程服务。
- 公共分页复用 `PageRequest`，除非接口契约明确要求不同默认值。

## Service

- service 负责一个领域或用例集合的业务编排。
- 数据库 session 通过构造函数传入，不在普通业务方法中创建新 session。
- 外部模型、时钟、runtime 或 client 在需要测试替换时通过构造参数、factory 或小型 adapter 注入。
- service 可以组合同领域 service，但应避免双向依赖和隐式全局状态。
- commit、rollback、文件写入、外部消息等副作用必须在方法职责中清晰可见。
- 返回稳定业务结构时使用明确类型，不把内部 ORM 实例直接返回给 route。

## Model 与持久化边界

- `models.py` 仅映射应用实际读写的既有表，不创建 schema 或迁移。
- model 字段名应与数据库列稳定对应；保留字或 JSON metadata 使用显式列名映射。
- ORM 适合常规查询和关系；pgvector、zhparser、JSONB cast 和 upsert 可使用参数化原生 SQL。
- 原生 SQL 较长或被多个方法复用时，应下沉到专用 query 模块或 repository，而不是继续扩张 service。

## 基础设施模块

- 配置只通过 `config.Settings` 和 `get_settings()` 读取；除环境选择入口外不得散写 `os.getenv`。
- Redis key 模板集中定义在 `redis_service.py` 或后续专用常量模块。
- 飞书、模型和其他外部 SDK 必须由小型 adapter 隔离，业务代码不依赖 SDK 原始响应的全部结构。
- 模块级 client 需要在应用关闭时释放；若测试难以替换，应提供显式 factory 或 dependency override 入口。

## 依赖方向

允许的主要方向：

```text
routes -> schemas, security, services
services -> schemas, models, context, infrastructure
security -> config, context, external auth adapter
infrastructure -> config, context
schemas/models -> Python and framework primitives
```

禁止 schema 或 model 反向导入 route/service，禁止基础设施模块导入具体业务 route。

## 新模块落位

新增业务模块时：

1. 在 `schemas/` 定义输入与稳定输出结构。
2. 在 `services/` 定义业务用例。
3. 在 `routes/` 定义 HTTP 映射和鉴权。
4. 在 `main.py` 注册 router。
5. 需要持久化时映射既有表，并明确租户字段。
6. 更新路由清单测试、架构模块表和相关验证。

