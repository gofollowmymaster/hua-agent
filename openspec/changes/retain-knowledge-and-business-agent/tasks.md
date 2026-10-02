# Tasks

## 1. API 业务边界

- [x] 1.1 精简 `AppModule`，只装配知识问答、业务Agent和仍被使用的全局基础设施，并通过根模块装配测试或 Nest 构建验证
- [x] 1.2 精简 `AiModule` 和 RAG Controller，只保留 RAG Admin 所需接口及依赖，并运行相关 RAG Jest 测试
- [x] 1.3 删除无关 API 业务域、外部渠道、测试与脚本，使用全仓引用搜索确认无残留导入
- [x] 1.4 清理仅由下线业务使用的 common/config provider 与 npm 依赖，并通过 `pnpm lint:check` 验证 API 静态检查
- [x] 1.5 更新 API 架构和规范文档，静态校验文档中的模块路径均存在

## 2. Global Admin 与 workspace

- [x] 2.1 删除 `apps/global-admin`、后端 Global Admin 及租户中间件排除逻辑，并通过引用搜索确认无 `global-admin` 运行时代码
- [x] 2.2 删除根脚本、lint-staged、workspace 构建和静态发布中的 Global Admin 引用，并验证 `pnpm install --lockfile-only` 可解析 workspace
- [x] 2.3 更新 workspace、前端共享架构和 AI 治理文档，确认不再将 Global Admin 列为活动应用

## 3. 数据模型与迁移

- [x] 3.1 从 MySQL Prisma schema 删除告警模型并新增仅删除对应表的 migration，使用 Prisma 校验确认 schema 有效
- [x] 3.2 从 RAG Prisma schema 与基线 SQL 删除定时任务模型，新增明确删除两张表的 SQL migration，并静态检查保留表未受影响
- [x] 3.3 移除定时任务注册服务和不再使用的 Prisma provider，运行 `pnpm pg` 验证客户端生成

## 4. RAG Admin 保留能力

- [x] 4.1 复核 RAG Admin 路由、菜单和 API client 只引用知识问答与业务Agent，补充路由边界测试并运行前端测试
- [x] 4.2 更新 RAG Admin 架构文档，确认五个业务Agent子页面及知识问答页面仍在文档与路由中一致

## 5. 集成验证

- [x] 5.1 运行 API 单元测试、`pnpm build:dev` 和 `pnpm admin:build`，修复所有由删减引起的编译或测试失败
- [x] 5.2 运行 OpenSpec strict validate、全仓残留引用检查与 `git diff --check`，确认变更满足规格且无格式错误
