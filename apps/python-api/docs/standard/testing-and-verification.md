# 测试与验证规范

## 测试原则

- 测试范围与变更风险匹配，先运行最小相关测试，再执行项目级检查。
- 单元测试必须确定性执行，不依赖公网、真实模型、真实飞书或共享环境数据。
- 每个 bugfix 至少包含一个能在修复前失败、修复后通过的回归测试。
- 测试不得通过放宽断言来掩盖未定义行为。

## 测试分层

### 单元测试

适用于纯转换、密码、Redis key、事件规范化、状态迁移和配置校验。使用 fake、monkeypatch 或构造函数注入隔离依赖。

### HTTP 测试

使用 `httpx.AsyncClient`、`ASGITransport` 与 `LifespanManager` 验证：

- route、method 和参数校验。
- 鉴权成功、未认证和无权限路径。
- JSON envelope 与错误结构。
- 文件 response header。
- OpenAPI 不被 envelope 包裹。
- SSE header、事件顺序和 `[DONE]`。

### 路由清单测试

`tests/test_contract_manifest.py` 锁定公开业务路由集合。新增、删除或修改 method/path 时必须同步更新，并由评审确认这是有意的接口变化。

### 数据库与 Redis 集成测试

使用隔离 PostgreSQL 和 Redis，数据库必须提供 pgvector 与 zhparser。至少覆盖：

- 租户 A 无法读取或修改租户 B 数据。
- ORM 与原生 SQL 的事务提交和回滚。
- vector、全文检索和 RRF 候选行为。
- Redis key、TTL、限流、幂等和受保护删除。
- 会话、消息与可见 parts 的持久化顺序。

### 外部集成冒烟测试

模型和飞书测试默认 mock。只有显式开关开启且使用隔离凭据时才运行实时冒烟测试；测试输出不得打印密钥或业务内容。

## 变更验证矩阵

| 变更类型 | 最小验证 |
| --- | --- |
| 纯函数、schema、配置转换 | 相关 pytest + lint + typecheck |
| route、鉴权、middleware、错误 | 相关 HTTP 测试 + 路由清单 + lint + typecheck |
| service、数据库、Redis | 单元/集成测试 + lint + typecheck |
| RAG、Agent、SSE | 事件顺序测试 + 持久化测试 + lint + typecheck |
| Docker、依赖或构建 | 全部测试 + build + 容器启动和 health smoke |
| 仅 Markdown | 链接与事实静态检查 + `git diff --check` |

## 项目级命令

```bash
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:test
pnpm python-api:build
```

需要稳定本地运行时使用 `pnpm python-api:dev` 或 `python -m python_api.run`。测试环境由根脚本显式设置 `PYTHON_API_ENV=test`。

## 交付记录

交付说明必须列出：

- 实际运行的命令和结果。
- 因数据库、Redis、模型、飞书或网络不可用而未运行的验证。
- 是否使用了 mock、隔离服务或实时凭据。
- 仍未覆盖的行为和残留风险。

