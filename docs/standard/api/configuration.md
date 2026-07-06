# 环境变量与项目配置规范

本文规定 `apps/api` 新增、读取和维护环境变量与项目配置时必须遵守的规则。项目配置架构说明见 `docs/architecture/api/project-architecture.md`，权限、租户与租户化配置模型见 `docs/architecture/api/auth-and-tenant.md`。

## 环境加载

所有依赖环境变量的项目命令都必须通过环境加载器执行：

- 开发环境：`pnpm env:dev -- <command>`
- 测试环境：`pnpm env:test -- <command>`
- 生产环境：`pnpm env:prod -- <command>`

后端环境文件位于 `apps/api/`。环境文件加载顺序由 `package.json` 中的 `dotenv-cli` 脚本决定，已存在变量不会被后续文件覆盖，因此本地文件优先：

- `dev`：`apps/api/.env.dev.local` → `apps/api/.env.dev` → `apps/api/.env`
- `test`：`apps/api/.env.test.local` → `apps/api/.env.test` → `apps/api/.env`
- `prod`：`apps/api/.env.prod.local` → `apps/api/.env.prod` → `apps/api/.env`

不要绕过 `pnpm env:<env> -- ...` 直接执行依赖环境变量的命令。

前端 `apps/rag-admin` 使用 Vite 自身的环境加载机制，具体规则见 `docs/architecture/rag-admin/build-and-runtime.md` 与 `docs/standard/rag-admin/README.md`。不要把后端数据库、机器人 secret、JWT secret 等敏感配置写入前端环境文件。

## 配置归属判断

新增配置前先判断归属：

- 所有环境通用且不是敏感值：可以放在 `src/config/index.ts` 的固定项目常量中。
- 不同运行环境不同：放入对应 `.env*` 文件，并在 `src/config/index.ts` 聚合。
- 不同租户可能不同：放入 `src/config/tenant/<tenant>.ts`，并在 `src/config/tenant/index.ts` 的类型中体现。
- 飞书机器人配置：优先进入 `robots` 或租户 `robots`，通过 `NodeConfigService.getRobotConfig` 读取。
- 飞书表格配置：优先进入 `feishuTables` 或租户 `feishuTables`，通过 `NodeConfigService.getFeishuTableConfig` 读取。

不要在业务代码中写死租户码、app token、table id、secret 或与环境相关的 URL。

## 配置聚合与读取

配置聚合入口是 `src/config/index.ts`。新增全局配置时，应在这里完成环境变量读取、默认值处理和类型转换。

业务代码读取配置时优先使用 `NodeConfigService`：

- `NodeConfigService.get`：读取可选全局配置。
- `NodeConfigService.getOrThrow`：读取必填全局配置，缺失时直接失败。
- `NodeConfigService.getTenantConfigItem`：读取指定租户配置项。
- `NodeConfigService.getTenantConfigItemAll`：读取所有租户的同一配置项。
- `NodeConfigService.getRobotConfig`：读取全局或租户化机器人配置。
- `NodeConfigService.getFeishuTableConfig`：读取全局或租户化飞书表格配置。

除配置层、框架初始化、少数底层适配代码外，不要在业务 Service、Controller、table adapter 中直接散写 `process.env`。

## 类型与默认值

新增全局配置时，同步维护 `src/config/interface.ts` 中的 `GlobalConfigType`。

新增租户配置时，同步维护：

- `src/config/tenant/index.ts` 中的 `TenantConfig`
- 依赖 `TenantConfig` 推导出的 `TenantConfigKey`
- 每个已有租户文件中的配置结构

数字、布尔值等环境变量必须在配置层集中解析：

- 数字配置参考 `src/config/index.ts` 中的 `numberEnv` 和 `maxNumberEnv`。
- 布尔配置参考租户配置文件中的 `booleanEnv` 模式。
- 有上限或安全边界的数值，应在配置层限制，不要把不可信字符串传入业务逻辑。

默认值必须表达清楚语义。生产敏感配置不应依赖本地开发默认值。

## 敏感信息与模板

真实密钥、token、数据库连接串、机器人 secret 等敏感信息应来自 `.env.*.local` 或部署环境变量。

模板文件只放占位值或安全默认值。新增后端本地必填变量时，同步维护 `apps/api/.env.dev.local.template`，并说明用途和默认值含义。新增前端本地变量时，按 RAG Admin 规范维护前端环境模板。

不要新增硬编码 secret。若历史代码中已有固定值，新增能力不要继续复制该模式；优先迁移到环境变量或租户配置。

## 变更检查清单

- 是否选择了正确归属：全局、环境、租户、机器人、表格或固定项目常量。
- 是否通过 `src/config/index.ts` 或 `src/config/tenant/` 聚合，而不是在业务代码中散读环境变量。
- 是否同步更新 `GlobalConfigType`、`TenantConfig` 或相关类型。
- 是否使用 `NodeConfigService` 的正确读取方法。
- 是否维护 API app 的环境模板，例如 `apps/api/.env.dev.local.template`。
- 是否避免输出、提交或复制真实密钥。
- 是否按任务类型阅读 `docs/ai-governance/testing-and-verification.md` 并完成静态检查。
