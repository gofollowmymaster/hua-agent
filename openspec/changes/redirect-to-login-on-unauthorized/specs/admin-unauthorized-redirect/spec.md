## ADDED Requirements

### Requirement: 无 token 时跳转认证中心
RAG Admin 和 Global Admin 在路由导航且本地没有 token 时，SHALL 清理登录态并跳转到现有认证中心登录页，且不得进入后台业务壳。

#### Scenario: 启动时没有 token
- **WHEN** 用户打开管理后台且本地没有 token
- **THEN** 系统调用登录登出流程跳转认证中心，并阻止当前导航渲染后台壳

#### Scenario: 已有 token 不跳转
- **WHEN** 用户打开管理后台且本地存在 token
- **THEN** 系统不触发认证中心跳转并允许进入后台

### Requirement: 接口 401 清理登录态并跳转
RAG Admin 和 Global Admin 的接口返回 HTTP 401 或业务 `code===401` 时，SHALL 清理 token 并跳转到现有认证中心登录页。

#### Scenario: 常规接口返回 HTTP 401
- **WHEN** axios 封装接口返回 HTTP 401
- **THEN** 系统清理 token 并跳转认证中心

#### Scenario: 常规接口返回业务 401
- **WHEN** axios 封装接口返回业务 envelope `code===401`
- **THEN** 系统清理 token 并跳转认证中心

#### Scenario: RAG 聊天流式接口返回 HTTP 401
- **WHEN** RAG Admin 聊天消息或流重连请求返回 HTTP 401
- **THEN** 系统清理 token 并跳转认证中心

### Requirement: 未授权跳转只触发一次
同一页面生命周期内发生多个未授权事件时，SHALL 只向认证中心发起一次跳转。

#### Scenario: 并发 401
- **WHEN** 多个请求同时返回 401
- **THEN** 系统只执行一次认证中心跳转
