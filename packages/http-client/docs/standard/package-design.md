# HTTP Client 包设计规范

本文规定 `packages/http-client` 的 factory、公共接口和错误处理规则。

## Factory 规则

- 公共创建入口统一为 `createHttpClient(options)`，每次调用返回独立 axios 实例。
- app 运行时配置通过 options 注入，包内不直接读取环境变量或全局状态。
- 默认 timeout 的变化属于公共行为变化，必须补充测试并检查所有消费者。
- token 获取函数在请求 interceptor 执行时调用，不能在 client 创建时固化 token。

## 公共接口规则

- 公共类型和函数统一从 `src/index.ts` 导出，不开放内部深路径。
- helper 方法必须支持 AxiosRequestConfig，不能阻断消费端设置 timeout、headers、signal 或 responseType。
- 保留原始 `AxiosInstance` 仅用于标准 helper 无法覆盖的 FormData、上传和高级配置；业务代码仍应优先使用 helper。
- 新增 HTTP method 前确认至少一个真实消费者，避免只包装 axios 的全部表面积。

## 响应与错误规则

- envelope 判断必须基于明确形状，不能把 Blob、数组或普通对象误判为业务响应。
- `code === 200` 只返回 `body`；非 200 必须 reject，不得返回真假混合结果。
- 后端提供 message 时保留可排查信息；无 message 时使用稳定的通用错误文案。
- 业务 401 与 HTTP 401 都调用 `onUnauthorized`，但不得吞掉原有 reject。
- 不在共享包中显示 toast、弹窗或执行路由跳转。

## 类型与依赖规则

- 公开泛型表达调用方期望的解包后数据，不复制具体业务响应模型。
- axios 是唯一运行时依赖；不得引入 Vue、Pinia、cookie 或认证 SDK。
- 新增依赖前评估浏览器包体积、重复实例和所有消费 app 的构建兼容性。
- 不导出或记录 access token，不在测试 fixture 中使用真实凭证。

## 测试与变更检查

- 测试覆盖 token 有无、动态 token、默认与自定义配置、成功 envelope、业务错误和原始响应。
- 401 测试同时覆盖业务 code 与 HTTP status，并断言回调和 reject 行为。
- 文件请求测试覆盖 Blob、responseType 和调用方 config 保留。
- 修改返回类型、错误语义、header 或 interceptor 顺序时，必须同步更新全部消费 app 并运行其测试和构建。
