# HTTP Client

`@aplus-sql/http-client` 为同 workspace 前端应用提供可注入认证策略的 axios client，不依赖 Vue、Pinia、cookie 或具体登录 SDK。

## Usage

```ts
import { createHttpClient } from '@aplus-sql/http-client';

export const { http, get, post, del, getBlob } = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  getAccessToken: () => tokenStore.token,
  onUnauthorized: () => tokenStore.logout(),
});
```

client 自动注入 Bearer token，解包 `{ code, body, message }`，并在业务 code 或 HTTP 状态为 401 时调用 `onUnauthorized`。无 envelope 的数据保持原样返回；`http` 用于 FormData、自定义 timeout 等高级 axios 配置。

业务 URL、请求 DTO、Pinia store 和登录跳转必须保留在消费 app，不得进入本包。

## Verification

```bash
pnpm http-client:build
pnpm http-client:test
pnpm http-client:lint:check
```
