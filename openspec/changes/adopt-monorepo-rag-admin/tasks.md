## 1. OpenSpec

- [x] 1.1 创建 proposal、design、tasks。

## 2. Monorepo Structure

- [x] 2.1 创建 `apps/api`、`apps/rag-admin`、`packages/shared` 目录结构。
- [x] 2.2 将现有后端源码、配置、Prisma、mock、public、scripts 迁移到 `apps/api`。
- [x] 2.3 更新 `pnpm-workspace.yaml` 为标准 workspace 包匹配。
- [x] 2.4 拆分根 `package.json` 和 `apps/api/package.json`，保留根命令兼容层。
- [x] 2.5 更新 TypeScript、Nest、Jest、Prisma、Docker、PM2 路径。

## 3. RAG Admin Backend

- [x] 3.1 新增 RAG 管理 DTO、controller、service。
- [x] 3.2 实现文档分页查询、删除、索引触发接口。
- [x] 3.3 实现会话分页查询和消息详情接口。
- [x] 3.4 补充 API 单元测试。

## 4. RAG Admin Frontend

- [x] 4.1 新建 Vue/Vite 前端 app。
- [x] 4.2 集成公司登录中心、token cookie 和 axios 请求封装。
- [x] 4.3 实现文档管理页面。
- [x] 4.4 实现消息对话记录页面。
- [x] 4.5 配置构建输出到 `apps/api/public/rag-admin`。

## 5. Docs and Verification

- [x] 5.1 更新 AGENTS/docs 中的目录和命令说明。
- [x] 5.2 运行 install/build/test/pg/rag-admin build 验证，记录无法执行的原因。
