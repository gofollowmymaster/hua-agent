## ADDED Requirements

### Requirement: Vue 应用可消费公共 UI 包

workspace SHALL 提供 `@aplus-sql/ui-kit` 公共入口，导出表格操作栏、文档预览能力、行点击 hook 及其公共类型，且不得依赖任何消费 app 的业务源码。

#### Scenario: RAG Admin 使用共享 UI
- **WHEN** RAG Admin 构建表格页面和文档预览交互
- **THEN** 应用从 `@aplus-sql/ui-kit` 的公开入口导入能力并成功完成类型检查和 Vite 构建

#### Scenario: 文档预览加载业务文件
- **WHEN** 消费 app 创建文档预览 hook 并注入 `loadFile(item)`
- **THEN** UI 包负责加载状态、文件预览和错误状态，但不直接调用消费 app 的业务 API

### Requirement: 表格公共组件不得固化消费应用状态

`TableTopActionBar` SHALL 由消费 app 显式提供刷新函数和 persistence key，不得读取消费 app 路由或引用 aplus-ui 非公开 context 路径。

#### Scenario: 保留现有表格设置
- **WHEN** RAG Admin 迁移到共享表格操作栏
- **THEN** 应用传入迁移前的完整 persistence key，已有 localStorage 列设置仍可被读取

#### Scenario: 未配置刷新能力
- **WHEN** 消费端未传入 `refreshConfig`
- **THEN** 表格操作栏不显示无效的刷新按钮

### Requirement: Vue 应用可创建独立 HTTP client

workspace SHALL 提供 `createHttpClient`，由消费 app 注入 base URL、超时、token 获取和未授权处理，并返回 axios 实例及 `get`、`post`、`del`、`getBlob` 方法。

#### Scenario: 请求携带动态 token
- **WHEN** `getAccessToken` 返回非空 token
- **THEN** client 在请求时添加 `Authorization: Bearer <token>`

#### Scenario: 处理业务 envelope
- **WHEN** 响应满足 `{ code, body, message }` 且 code 为 200
- **THEN** client 返回 body；当 code 非 200 时以 message 拒绝请求

#### Scenario: 处理未授权响应
- **WHEN** 业务 code 或 HTTP 状态为 401
- **THEN** client 调用消费 app 提供的 `onUnauthorized`

#### Scenario: 处理原始响应和文件
- **WHEN** 服务返回无 envelope 的数据或 Blob
- **THEN** client 保持原始响应数据和文件请求配置可用

### Requirement: 共享包保持 workspace 源码包边界

两个共享包 MUST 保持私有源码包，通过 package exports 暴露公共入口，并提供独立 typecheck、测试和静态检查命令。

#### Scenario: 新增同栈前端应用
- **WHEN** 同 workspace 的 Vue 3/Vite 应用声明 workspace 依赖
- **THEN** 应用无需复制源码即可导入两个共享包，且不得通过包内深路径访问实现
