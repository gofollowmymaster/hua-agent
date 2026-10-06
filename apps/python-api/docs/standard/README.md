# Python API 开发与验证规范

## 开发规则

- 使用 Python 3.12 和 uv，并以已提交的 `uv.lock` 为准。
- router 保持轻量，业务行为放在 service 中。
- 仅通过 `config.Settings` 读取环境变量。
- 新配置必须加入 `.env.example`；真实密钥只允许出现在 `.env.*.local` 或部署环境中。
- `REDIS_*` 是标准变量名；`DB_REDIS_*` 仅用于迁移期兼容，不得用于新部署配置。
- 在请求处理链路中使用异步数据库、Redis、模型和飞书客户端。
- 新增类和类方法时添加简洁的 docstring。
- 不得新增 schema migration，也不得重复承担 Prisma 的 schema 管理职责。
- 新增或修改 NestJS 接口时，必须在同一变更中同步更新 Python 路由清单和差异测试 fixture。

## 必须执行的检查

```bash
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:test
pnpm python-api:build
```

开发、测试和生产命令分别显式设置 `PYTHON_API_ENV=dev/test/prod`。配置相关变更还必须覆盖环境文件
优先级、核心配置启动失败、可选集成延迟失败和密钥脱敏测试。

数据库与 Redis 集成测试需要使用启用了 pgvector 和 zhparser 的隔离服务。实时模型和飞书冒烟测试
仅在显式启用时运行；可确定性复现的单元测试和契约测试必须使用 mock。进行对等性验收时，应让两个
服务连接同一套隔离状态，并比较响应状态码、响应头、响应体、文件、SSE 事件序列以及数据库和 Redis
副作用。
