# HTTP Client 开发规范

`packages/http-client/docs/standard/` 记录 HTTP client 工厂、公共接口、错误语义和测试规范。架构边界见 `packages/http-client/docs/architecture/README.md`。

## 阅读顺序

1. `package-design.md`：工厂接口、认证注入、响应处理、依赖和验证规则。
2. 受影响消费 app 的 API client 架构文档；当前包括 RAG Admin 和 Global Admin。

## 验证入口

修改 HTTP Client 后至少运行：

```bash
pnpm http-client:build
pnpm http-client:test
pnpm http-client:lint:check
```

同时运行所有受影响消费 app 的测试和生产构建；当前至少运行 `pnpm admin:build` 和 `pnpm global-admin:build`。涉及 token 或 401 行为时补充消费 app 登录流程 smoke test。
