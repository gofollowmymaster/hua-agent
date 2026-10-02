# Design

## Context

`AppModule` 当前同时装配 11 个业务模块、全局定时任务与两个管理后台；`AiModule` 又混合 RAG、Aily、日志操作和企微 Bot。RAG Admin 已只展示知识问答与业务Agent，但 workspace、API、数据库和文档仍保留大量无关能力。保留模块依赖现有租户中间件、Guard、配置、RAG Prisma、日志、异常处理与静态资源服务。

## Goals / Non-Goals

**Goals:**

- 从编译、路由、部署和持久化层物理移除非目标业务。
- 保持两个保留模块的前端页面和 HTTP/AGUI 契约不变。
- 让根模块和公共基础设施只包含实际仍被使用的 provider。

**Non-Goals:**

- 不重构 RAG 或 deepagents 工作流。
- 不为已删除 URL 提供兼容响应或转发。
- 不在代码执行阶段直接操作开发、测试或生产数据库。

## Decisions

### 1. 以可达依赖图决定保留代码

从 RAG Admin 页面调用的 API 开始向后追踪 Controller、Service 和公共 provider，只保留可达实现。`AppModule` 仅装配精简后的 `AiModule`、`AgentModule` 与仍有消费者的全局基础设施。相比只从根模块停止加载，物理删除能同步降低编译面和误恢复风险。

### 2. 拆除 AiModule 内的非后台能力

保留 `/ai/rag/chat` 与 `/ai/rag/admin/*`，删除未被 RAG Admin 使用的 RAG 管理端点、Aily、日志操作和企微 Bot。RAG 内部服务按保留 Controller 的真实依赖继续注册，避免改变问答算法。

### 3. Global Admin 整体删除

删除 `apps/global-admin`、后端 `global-admin` 业务域、TenantMiddleware 的无租户排除、根脚本和静态发布引用。相比保留不可发布源码，整体删除符合产品边界并避免无后端的僵尸前端。

### 4. 数据删除通过迁移表达

MySQL schema 删除告警模型并新增 Prisma migration；RAG schema 删除定时任务模型并新增配套 SQL migration，同时更新基线 `schema.sql`。迁移只提交脚本，不由实现过程直接连接数据库执行；部署前必须备份目标表。

### 5. 公共基础设施按消费者清理

删除仅由下线模块使用的 schedule/queue/飞书表格、固定 token、机器人和外部集成设施；保留鉴权、租户、Redis、RAG Prisma、日志、异常处理和文档解析所需能力。依赖项仅在全仓无引用且构建验证通过后移除。

## Risks / Trade-offs

- [删除迁移不可逆且会丢失历史数据] -> 迁移文件使用明确表名，部署前强制备份，回滚仅恢复代码和数据库备份。
- [公共代码的隐式依赖可能在删除后暴露] -> 先用静态引用搜索，再以 TypeScript 构建和单测闭环修复。
- [删除外部入口会影响未知调用方] -> 这是已确认的 breaking change，不提供兼容层；发布说明列出 404 的接口域。
- [Node 24 高于仓库文档中的 Node 20] -> 以当前实际环境验证；若依赖暴露兼容问题，记录并在 CI 支持版本复验。

## Migration Plan

1. 发布前备份 `AlertMessage`、`AlertMessageUser`、`ScheduledTask`、`ScheduledTaskLog` 表。
2. 先部署不再访问这些表的精简应用代码。
3. 执行 MySQL Prisma migration 与 RAG SQL migration，重新生成 Prisma client。
4. 验证保留接口、RAG Admin 页面和已删除 URL 的 404 行为。
5. 回滚时恢复上一版应用，并从备份恢复已删除表；迁移本身不提供自动重建历史数据的 down 脚本。
