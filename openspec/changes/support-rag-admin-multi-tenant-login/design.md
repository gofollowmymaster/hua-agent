## Context

RAG Admin 通过 `@aplus-frontend/aplus-auth-sdk` 跳转登录中心。当前 `auth.ts` 同时维护认证环境、C 租户地址和多处跳转参数，`.env` 还固定声明 `VITE_SUPPLIER_CODE=C`。后端已经从 JWT `supplierCode` 建立 `TenantContext`，因此本次只需修正登录前的租户和地址选择。

## Goals / Non-Goals

**Goals:**

- 用单一配置维护 A、C、D 的域名规则、服务商码及各环境登录和认证 API 地址。
- 统一 SDK 初始化、首次登录和退出登录的跳转参数。
- 通过纯函数测试环境优先级、域名边界和默认行为。

**Non-Goals:**

- 不增加租户选择或切换 UI。
- 不修改 JWT、API Guard、TenantMiddleware 或数据模型。

## Decisions

1. 在 `src/stores/modules/user/tenant-auth.config.ts` 集中维护配置，并将 user store、登录 SDK、token cookie 和认证测试收拢到 `src/stores/modules/user/` 功能目录。相比把用户认证职责分散在 `stores` 与顶层 `auth`，同域目录更容易发现和维护；`token.ts` 仍可独立导入，避免请求层依赖 Pinia 实例。
2. `resolveAuthEnv` 先读取非空 `VITE_AUTH_ENV`，否则读取 Vite `MODE`；将 `production` 规范化为 `prod`，未知值回退 `dev`。这兼容 SDK 的环境枚举与 Vite 默认 mode。
3. hostname 采用大小写无关的精确域名或点分后缀匹配，避免 `fake-aplnk.com` 之类的包含匹配误判。未匹配域名回退 C，以保持 localhost 和既有部署行为。
4. `auth.ts` 在模块加载时解析一次租户与环境，并用同一个登录参数对象配置 `redirectLoginExtraParams`、`ensureLogin` 和 `logout`，避免不同入口产生租户漂移。
5. 使用 Vitest 测试纯配置解析和 mock 后的 SDK 调用。相比只做构建检查，测试能直接锁定安全敏感的域名与跳转矩阵。
6. 保持 `@/stores/modules/user` 作为 user store 的公共入口，其他模块仅将旧 token 工具路径更新为 `@/stores/modules/user/token`。该目录调整不改变运行时行为或公共 store API。
7. 登录 SDK 的 `apiUrl` 与登录地址使用同一个租户和认证环境解析结果，不再从独立的认证 API 环境变量或 RAG 业务接口的 `VITE_API_BASE_URL` 推导。`development` 使用空地址以保留本地同源代理行为，其他环境使用集中维护的服务商 API 地址。

## Risks / Trade-offs

- [未知生产域名会回退 C] → 文档明确该产品约定，并测试后缀边界，新增域名时集中修改配置。
- [静态登录地址可能随基础设施调整而过期] → 地址全部集中在单文件和 OpenSpec 中，便于审查与回滚。
- [静态认证 API 地址可能随基础设施调整而过期] → API 地址与登录地址使用同一配置定义和自动化测试维护。
- [SDK 初始化可能自行重定向] → 初始化与显式跳转始终使用相同配置，避免竞态导致目标不一致。

## Migration Plan

发布新前端产物后，现有 C 域名继续解析为 C，A/D 域名开始跳转各自登录中心。回滚只需恢复前端产物；后端和数据无需迁移。

## Open Questions

无。
