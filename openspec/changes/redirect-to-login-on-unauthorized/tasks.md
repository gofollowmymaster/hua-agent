## 1. 登录跳转收敛

- [x] 1.1 在两个 app 的 `stores/modules/user/auth.ts` 增加幂等 `redirectToLogin()`
- [x] 1.2 更新两个 app 的 `auth.spec.ts` 覆盖无 token、有 token 和重复 logout

## 2. 路由守卫拦截

- [x] 2.1 RAG 新增 `src/router/route-auth.ts` 并接入 `router/index.ts`
- [x] 2.2 Global 调整 `prepareGlobalAdminRoute()` 返回 boolean 并接入 router
- [x] 2.3 新增/更新路由守卫单测

## 3. 聊天流式 401

- [x] 3.1 新增 `apps/rag-admin/src/api/common/unauthorized-fetch.ts` 公共 fetch helper
- [x] 3.2 两个 RAG chat adapter 接入自定义 fetch
- [x] 3.3 新增 `unauthorized-fetch.spec.ts`

## 4. 文档与验证

- [x] 4.1 同步两个 app 的 `auth-and-api-client.md`
- [x] 4.2 运行 RAG/Global 测试、构建和 lint
