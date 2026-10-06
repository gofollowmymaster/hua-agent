# 鉴权、租户与接口契约

## 请求上下文

`TenantMiddleware` 为每个请求创建 `RequestContext`，并通过 `ContextVar` 在异步调用链中传递：

- `tenant_code`：当前租户。
- `user`：已解析或已认证的身份字段。
- `request`：当前 Starlette request。

middleware 在响应结束后使用 token 重置上下文，避免上下文泄漏到其他请求。没有请求上下文时，`get_request_context()` 返回使用默认租户值的空上下文；业务入口仍应由 middleware 建立正式上下文。

## 租户解析

租户按以下顺序解析：

1. `supplier` header。
2. Bearer JWT 中未校验签名的 `supplierCode`，仅用于提前建立上下文。
3. 非 Bearer `Authorization` 被标记为固定 token，实际校验在路由依赖中完成。
4. `Settings.default_tenant`。

服务商码 `A`、`C`、`D` 分别映射到 `aplus`、`boat`、`yurex`。正式身份与权限必须由 security dependency 校验，不能把 middleware 的预解析结果当作授权结论。

## 鉴权方式

| 依赖 | 行为 | 使用范围 |
| --- | --- | --- |
| `require_bearer` | 校验 HS256 JWT 和 `loginTime` 有效期，更新请求用户 | RAG、Agent 知识库及后台能力 |
| `require_system_admin` | 在 Bearer JWT 基础上校验 `isSystemAdmin` | 用户管理 |
| `require_fixed_token` | 读取飞书表格记录，校验启用状态和模块范围，并更新租户 | 系统调用 |
| `require_composite_auth` | Bearer 走 JWT，否则走固定 token | Agent Chat、DS Order Mock |

密码使用 scrypt 格式：`scrypt$<base64-salt>$<base64-key>`。密码比较使用 `hmac.compare_digest`。

## 租户隔离

- 数据库查询、更新和删除必须同时约束资源主键与 `tenant_code`。
- 父子表查询同时约束 document/session 和 chunk/message 的租户字段。
- 租户化 Redis key 必须包含 `{tenant}` 并通过集中 helper 展开。
- 文件扫描和预览路径必须从受控根目录解析，并验证解析结果仍位于根目录内。
- 进程内状态必须按租户建立独立副本。

## JSON 响应

成功的 JSON 响应默认由 `ResponseEnvelopeMiddleware` 包裹：

```json
{
  "code": 200,
  "body": {},
  "message": "请求成功"
}
```

以下响应不会自动包裹：

- HTTP 状态码不小于 300 的响应。
- `/swagger/json`。
- 带有 `x-skip-transform: 1` 的响应。
- `content-type` 不是 `application/json` 的响应，例如文件和 SSE。

已经包含非空 `code` 和 `message` 的 JSON 对象不会重复包裹。

## 错误响应

- Pydantic 请求校验错误返回业务 `code: 400` 和字段消息数组。
- `HTTPException` 保留其状态语义，并转换为统一 JSON 结构。
- `AppError` 保留项目定义的 code；`NotReportError` 表示无需告警的业务错误。
- 配置错误仅报告缺失或无效的配置项名称。
- 唯一约束冲突和未捕获异常由全局 handler 统一转换。

新增代码不得在 route 中手工复制全局错误结构，也不得将 secret、Authorization、请求体或知识内容加入错误消息。

## 文件响应

文档预览使用 `FileResponse`，根据文件类型选择 media type，并同时提供 ASCII fallback 文件名和 RFC 5987 UTF-8 文件名。响应设置 `x-skip-transform: 1`，确保 middleware 不读取或包裹文件内容。

## UI Message SSE

`ui_stream.stream_response` 将异步事件编码为：

```text
data: <compact-json>\n\n
data: [DONE]\n\n
```

响应使用 `text/event-stream`，设置 `x-vercel-ai-ui-message-stream: v1`、`x-accel-buffering: no` 和禁止缓存的 header。

RAG 与 Agent 可发送 `data-status`、`reasoning-start/delta/end`、`text-start/delta/end` 以及工具状态事件。事件必须按用户可见顺序产生；同一 reasoning 或 text id 必须先 start、再 delta、最后 end。流结束后发送 `[DONE]`。

## OpenAPI

非生产环境默认暴露 `/swagger` 和 `/swagger/json`。生产环境默认关闭，可通过 `PYTHON_API_DOCS_ENABLED` 显式覆盖。OpenAPI JSON 必须保持原始 schema，不能套用业务 envelope。

