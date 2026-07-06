# API 开发规范

`docs/standard/api/` 记录 `apps/api` 后端实现规范。后端架构事实见 `docs/architecture/api/README.md`，AI 工作流和验证要求见 `docs/ai-governance/README.md`。

## 阅读顺序

1. `code-style.md`：TypeScript/NestJS 代码风格、异常、日志和装饰器写法。
2. `module-design.md`：模块、Controller、Service、DTO、adapter、table、schedule、processor 的放置和分层规则。
3. `configuration.md`：后端环境变量、租户配置、NodeConfigService 和敏感信息维护规则。
4. `redis.md`：Redis key、缓存、限流、幂等和批量删除规范。
5. `background-jobs.md`：定时任务、BullMQ 队列处理器和后台任务规范。

## 任务类型到必读文档

| API 任务类型 | 必读规范 | 补充上下文 |
| --- | --- | --- |
| 新增或修改接口、业务行为 | `module-design.md`、`code-style.md` | `docs/architecture/api/directory-structure.md`、`docs/architecture/api/auth-and-tenant.md` |
| 新增模块、Service、DTO、adapter、table、schedule | `module-design.md`、`code-style.md` | `docs/architecture/api/directory-structure.md` |
| 修改配置、环境变量、租户配置 | `configuration.md`、`module-design.md` | `docs/architecture/api/project-architecture.md`、`docs/architecture/api/auth-and-tenant.md` |
| 修改 Redis key、缓存、限流、幂等、批量删除 | `redis.md`、`module-design.md` | `docs/architecture/api/auth-and-tenant.md` |
| 修改定时任务、队列 processor、后台任务 | `background-jobs.md`、`module-design.md` | `docs/architecture/api/project-architecture.md` |
| 涉及飞书或外部系统集成 | `module-design.md`、`configuration.md` | `docs/architecture/api/feishu-integration.md` |
| 涉及 Prisma schema、租户、鉴权 | `module-design.md`、`configuration.md` | `docs/architecture/api/auth-and-tenant.md` |

## API 验证入口

- 普通单元测试：`pnpm env:test -- pnpm test` 或更小范围 Jest 命令。
- API 构建：`pnpm env:dev -- pnpm build:dev`。
- Prisma schema 变更：`pnpm pg`，需要迁移时再按环境执行迁移命令。

具体验证矩阵见 `docs/ai-governance/testing-and-verification.md`。
