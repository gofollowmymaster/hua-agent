# Workspace 开发规范

本文规定 pnpm workspace 根层的脚本、依赖、跨包引用和边界规则。各子项目实现规范见 `docs/standard/api/README.md`、`docs/standard/rag-admin/README.md` 和 `docs/standard/shared/README.md`。

## 根目录职责

根目录只承载：

- workspace 配置和锁文件。
- 根 `package.json` 兼容脚本。
- OpenSpec、长期文档和部署入口。
- 跨子项目统一的工具配置。

不要在根目录新增业务源码。业务能力应进入对应 app 或 shared 包。

## 脚本命名

- API 历史脚本可继续保留短命令，例如 `pnpm start:dev`、`pnpm build:dev`、`pnpm test`。
- 新增 API 根脚本应通过 `pnpm --filter @aplus-sql/api ...` 转发。
- RAG Admin 根脚本使用 `rag-admin:*` 前缀，例如 `pnpm rag-admin:build`。
- shared 包脚本使用 `shared:*` 前缀；当前 shared 没有构建脚本时不要虚构命令。

依赖后端环境变量的命令必须通过 `pnpm env:<env> -- ...` 加载 API 环境。前端命令不要使用 API 的 dotenv 加载器。

## 依赖放置

- 只被某个 app 使用的依赖放入该 app 的 `package.json`。
- 同时被多个 workspace 包直接 import 的依赖，才考虑放在根层或 shared 所在包。
- 前端 UI、Vue、Vite 依赖放在 `apps/rag-admin/package.json`。
- NestJS、Prisma、Redis、BullMQ、飞书 SDK 等后端依赖放在 `apps/api/package.json`。
- 根 `package.json` 只保留 workspace 调度或全局工具所需依赖。

## 跨包引用

- `apps/api` 和 `apps/rag-admin` 之间不直接互相 import 源码。
- 跨端稳定类型或无副作用工具放入 `packages/shared` 后，再由消费者通过 workspace 包引用。
- shared 包不能依赖 app 内部路径。
- 引入 shared 前，必须确认有真实的跨包复用需求，避免为假想复用提前抽象。

## 跨端变更

涉及接口契约、鉴权 token、静态资源路径、构建输出目录、shared 导出的变更，必须同时检查受影响子项目：

- 后端 DTO、Controller、返回结构和 Guard。
- 前端 API client、页面使用方、路由和状态。
- shared 导出类型和所有消费者。

验证要求见 `docs/ai-governance/testing-and-verification.md`。
