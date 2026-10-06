# FastAPI 最佳实践采用矩阵

本项目参考 [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices/tree/5e00aa6095521f0d00e4eec2ef0afa44cd566af4)，固定参考提交为 `5e00aa6095521f0d00e4eec2ef0afa44cd566af4`。上游仓库未声明许可证，因此本文只记录项目内的采用结论，不复制上游原文。

| 实践 | 状态 | 本项目约定 |
| --- | --- | --- |
| 按业务域组织代码 | 采用 | 业务代码位于 `python_api/modules/<domain>/`，领域拥有 router、schema、model、service、repository 与 adapter。 |
| 共享基础设施集中管理 | 采用 | `core/` 管理配置门面、数据库工厂、lifespan 资源、异常、中间件和流协议。 |
| 外部系统使用 adapter | 采用 | Redis、飞书、embedding 位于 `integrations/`，由 lifespan 构造并通过 dependency 或构造参数传递。 |
| 异步测试客户端 | 采用 | HTTP 测试使用 `httpx.AsyncClient`、`ASGITransport` 与 `LifespanManager`。 |
| 阻塞工作离开事件循环 | 采用 | 文件读取、hash、Office/PDF 解析及密码/飞书同步调用使用受容量限制的 AnyIO worker thread。 |
| 明确依赖与可替换 factory | 采用 | `create_app` 接受 `Settings` 与 resource factory override，request dependency 从 `app.state` 获取资源。 |
| REST 路由重新设计 | 调整 | 保持现有 NestJS 兼容 method/path，不因目录重构修改接口。 |
| 数据库迁移由 Python 管理 | 不适用 | 不引入 Alembic；Prisma 与 `apps/api/prisma/rag/schema.sql` 是唯一数据库权威。 |
| 所有返回值强制 response model | 调整 | 仅在可证明序列化完全一致时使用；文件与 SSE 保持显式 Response。 |

架构建议服从本项目的兼容契约：31 条业务路由、响应 envelope、JWT/固定 token、租户条件、Redis key/TTL、文件 header 与 UI Message SSE 顺序均不得改变。
