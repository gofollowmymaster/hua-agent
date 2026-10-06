# API 契约规范

## 请求模型

- JSON body、query 和 path 参数必须有明确类型与约束。
- 面向客户端的 camelCase 字段使用 alias，内部业务代码使用 snake_case。
- 空字符串、范围、最大长度和有限枚举应在 schema 层拒绝。
- 跨字段条件使用 `model_validator`，错误消息应稳定且可供调用方理解。
- 不在 route 或 service 中重复实现 schema 已覆盖的结构校验。

## 鉴权

- 公开接口必须显式保持最小范围，新增公开接口需在评审说明原因。
- 后台用户接口默认使用 Bearer JWT；管理员能力追加系统管理员校验。
- 需要固定 token 的接口必须校验启用状态、使用范围和租户来源。
- route 获得的身份只用于当前请求，不写入模块级可变状态。
- middleware 的 JWT 预解析只用于建立租户上下文，不能代替正式签名校验。

## 响应类型

- 稳定 JSON payload 应定义 Pydantic response model 或 TypedDict，并在 route 返回类型中体现。
- 分页结构统一包含当前页、页大小、总数和记录列表，字段名称遵守已有接口契约。
- ORM model、SQLAlchemy Row、SDK response 和异常对象不能直接作为响应返回。
- JSON 时间、Decimal、bytes 等值通过集中转换函数规范化。
- `ResponseEnvelopeMiddleware` 统一处理成功 envelope，route 不重复包装。

## 错误

- 输入错误使用 Pydantic validation 或 `HTTPException(400, ...)`。
- 领域错误优先使用稳定的项目异常类型；无需告警的可预期错误使用 `NotReportError`。
- 未认证和无权限分别使用 401 和 403 语义。
- 对外错误不得直接包含 SQL、堆栈、secret、Authorization、内部路径或远程 SDK 原始响应。
- 捕获异常进行降级时必须限定异常范围，并记录脱敏诊断或返回明确降级状态。

## 文件响应

- 返回文件前验证资源属于当前租户并且最终路径位于允许根目录内。
- 根据实际文件类型设置 media type。
- `Content-Disposition` 同时提供安全 ASCII fallback 和 UTF-8 文件名。
- 设置 `x-skip-transform: 1`，禁止 JSON middleware 缓冲文件内容。

## SSE

- 流式接口统一通过 `ui_stream.stream_response` 输出 UI Message SSE。
- 事件数据必须可 JSON 序列化，不能携带 SDK 对象或异常对象。
- reasoning、text 和 tool 生命周期必须按开始、增量、结束顺序输出。
- 累计快照必须在边界处转换为增量，不能把累计全文重复发送给客户端。
- 工具调用使用稳定调用 id 关联开始和结果；成功但没有可展示结果时发送明确摘要。
- 生成结束后持久化的 `parts` 顺序必须与用户实际看到的顺序一致。
- 正常流以 `[DONE]` 结束；异常不得伪装成成功完成。

## OpenAPI 与路由清单

- 新增或修改路由时同步更新 `tests/test_contract_manifest.py` 的业务路由清单。
- route 的 method、path、鉴权 dependency、请求 schema 和响应类型必须进入评审。
- `/swagger/json` 保持原始 OpenAPI JSON，不经过业务 envelope。
- 非生产环境默认启用文档，生产环境是否启用由配置决定。

